
import json, asyncio
from lobby.models import Lobby, LobbyChatMessage
from tournament.models import Tournament, TournamentPlayer
from match_history.models import MatchHistory
from django.contrib.auth.models import User
from .pongObjects import Pong, vars
from django.utils.timezone import now
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

lobbies = {}
deleteTimers = {}
connections = {}

class PongConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.lobby_id = self.scope["url_route"]["kwargs"]["lobby_id"]
		self.user = self.scope["user"]
		self.username = self.user.username
		self.user_id =  str(self.user.id)

		if self.lobby_id not in lobbies:
			lobbies[self.lobby_id] = {"players": dict(), "gameLoop": None, "game": Pong()}
		
		lobby = lobbies[self.lobby_id]

		await self.connectTimerDeletion()
		await self.handleConnections()
		await self.channel_layer.group_add(self.lobby_id, self.channel_name)
		await self.accept()

		lobby["players"][self.user_id] = self.username
		
		game = lobby["game"]
		
		await self.setPaddleMovement(game)
		await self.readyState(False)
		await self.graphicsInit()

		if game.running:
			await self.sendMessage('readyBtn', 'add')
		else:
			await self.sendMessage('readyBtn', 'remove')
	
	async def handleConnections(self):
		if self.lobby_id not in connections:
			connections[self.lobby_id] = {}

		if self.user_id in connections[self.lobby_id]:
			connected_channel_name = connections[self.lobby_id][self.user_id]
			await self.channel_layer.send(connected_channel_name, {"type": "force_disconnect"})
			del connections[self.lobby_id][self.user_id]
			await asyncio.sleep(0.1)

		await asyncio.sleep(0.1)
		connections[self.lobby_id][self.user_id] = self.channel_name
	
	async def connectTimerDeletion(self):
		if self.user_id in deleteTimers:
			deleteTimers[self.user_id ].cancel()
			del deleteTimers[self.user_id]
	
	async def force_disconnect(self):
		await self.close(4001)

	async def disconnect(self, close_code):
		if close_code == 4001:
			return

		lobby = lobbies.get(self.lobby_id)

		if lobby and self.user_id in lobby["players"]:
			del lobby["players"][self.user_id]

		if self.user_id not in deleteTimers:
			deleteTimers[self.user_id ] = asyncio.create_task(self.deleteLobbyTask(lobby))

	async def deleteLobbyTask(self, lobby):
		await asyncio.sleep(3)
		game = lobby["game"]

		print("\nPLAYERS: ", lobby["players"], flush=True)
		if not lobby["players"]:
			await self.deleteLobbyWS(lobby)
			await self.deleteLobbyDB()
			print("\n DELETED LOBBY", flush=True)
		else:
			try:
				winner_id = game.player1Token if game.player1Token is not self.user_id else game.player2Token
				winner_username = lobby["players"][winner_id]
				if game.running == False:
					await self.setReturningDB(self.username, False)
					await self.win(game, winner_username, self.lobby_id)
			except Exception as e:
				print(f"Error: {e}", flush=True)

		deleteTimers.pop(self.user_id, None)
		await self.channel_layer.group_discard(self.lobby_id, self.channel_name)

	async def deleteLobbyWS(self, lobby):
		if lobby["gameLoop"]:
			lobby["gameLoop"].cancel()
			try:
				await lobby["gameLoop"]
			except asyncio.CancelledError:
				await self.sendMessage('log', 'Game Loop Cancel Error')
			lobby['game'].running = False
			lobby["gameLoop"] = None

		del lobbies[self.lobby_id]

	async def deleteLobbyDB(self):
		try:
			dbLobby = await database_sync_to_async(Lobby.objects.get)(lobby_id=self.lobby_id)
			await database_sync_to_async(dbLobby.delete)()
		except Lobby.DoesNotExist:
			print(f"Lobby {self.lobby_id} does not exist in the database", flush=True)
			await self.sendMessage('log', "Lobby does not exist")

	
	async def receive(self, text_data):
		lobby = lobbies.get(self.lobby_id)
		game = lobby["game"]
		try:
			data = json.loads(text_data)
			send_type = data.get('type')
			payload = data.get('payload')

			match(send_type):
				case 'p1':
					game.paddle1.moving = payload['direction']
				case 'p2':
					game.paddle2.moving = payload['direction']
				case 'ready':
					ready = await self.readyState(True)
					if ready:
						if not lobby["gameLoop"]:
							lobby["gameLoop"] = asyncio.create_task(self.runLoop())
				case 'pause':
					if game.gamePaused == False:
						game.gamePaused = True
					else:
						game.gamePaused = False
				case 'message':
					await self.saveChatMessageDB(payload)

			await self.groupSend(send_type, payload)

		except:
			await self.sendMessage('log', 'Type and Payload keys are required!')

	async def groupSend(self, send_type, payload):
		await self.channel_layer.group_send(
			self.lobby_id,
			{
				'type': 'sendLobby',
				'send_type': send_type,
				'payload': payload
			}
		)

	async def sendLobby(self, event):
		await self.sendMessage(event['send_type'], event['payload'])

	async def sendMessage(self, send_type, payload):
		await self.send(text_data=json.dumps({'type': send_type, 'payload': payload}))

	async def runLoop(self):
		try:
			while True:
				if self.lobby_id not in lobbies:
					break
				lobby = lobbies.get(self.lobby_id)
				game = lobby["game"]
				if game.gamePaused:
					await asyncio.sleep(0.016)
					continue

				action = game.update_state()
				winner = game.winCheck()
				if action == 1:
					await self.groupSend("shake", {})
				elif action == 2:
					await self.groupSend("point", payload={"player1Score": game.player1Score, "player2Score": game.player2Score})
				await self.sendState()
				await asyncio.sleep(0.016)
				if winner:
					await self.win(game, lobby["players"][winner], self.lobby_id)
					break
		except Exception as e:
			await self.sendMessage('log', f'Error is runLoop: {e}')
		finally:
			await self.sendMessage('log', 'Game End')

	async def win(self, lobby_game, winner_username, lobby_id):
		await self.updateWinnerDB(winner_username)
		await self.createMatchHistory(lobby_game, self.lobby_id, winner_username)
		await self.groupSend('gameOver', {"winner": winner_username})

	async def sendState(self):
		lobby = lobbies.get(self.lobby_id)
		game = lobby["game"]
		payload = {
			"ballPositionX" : game.ball.positionX,
			"ballPositionZ" : game.ball.positionZ,
			"paddle1PositionZ": game.paddle1.positionZ,
			"paddle2PositionZ": game.paddle2.positionZ,
		}
		await self.groupSend("state", payload)

	async def graphicsInit(self):
		payload = {
			"ballRadius": vars.BALL_RADIUS,
			"boundariesWidth": vars.BOUNDARIES_WIDTH,
			"boundariesHeight": vars.BOUNDARIES_HEIGHT,
			"boundariesDepth": vars.BOUNDARIES_DEPTH,
			"floorPositionX": vars.FLOOR_POSITION_X,
			"floorPositionY": vars.FLOOR_POSITION_Y,
			"floorPositionZ": vars.FLOOR_POSITION_Z,
			"ceilingPositionX": vars.CEILING_POSITION_X,
			"ceilingPositionY": vars.CEILING_POSITION_Y,
			"ceilingPositionZ": vars.CEILING_POSITION_Z,
			"paddle1PositionX": vars.PADDLE1_POSITION_X,
			"paddle1PositionZ": vars.PADDLE1_POSITION_Z - 50,
			"paddle2PositionX": vars.PADDLE2_POSITION_X,
			"paddlePositionY": vars.PADDLE_POSITION_Y,
			"paddle2PositionZ": vars.PADDLE2_POSITION_Z - 50,
			"paddleWidth": vars.PADDLE_WIDTH,
			"paddleLength": vars.PADDLE_LENGTH,
			"paddleDepth": vars.PADDLE_DEPTH,
		}
		await self.sendMessage("graphicsInit", payload)

	async def setPaddleMovement(self, game):
		if not game.player1Token or game.player1Token == self.user_id:
			game.player1Token =  self.user_id
			await self.sendMessage('paddleInit', {'player':'1'})
		elif not game.player2Token or game.player2Token == self.user_id:
			game.player2Token =  self.user_id
			await self.sendMessage('paddleInit', {'player':'2'})

	async def readyState(self, state):
		serverLobby = lobbies[self.lobby_id]
		game = serverLobby["game"]
		try:
			dbLobby = await database_sync_to_async(Lobby.objects.get)(lobby_id=self.lobby_id)
			await self.saveReadyStateDB(game, dbLobby, state)
			
			if dbLobby.player1Ready and dbLobby.player2Ready:
				await self.groupSend('log', 'GAME START!')
				dbLobby.gameState = "running"
				game.running = True
				return True
			return False
		except Exception as e:
			await self.groupSend('log', f'Ready State Error: {e}')

	async def saveReadyStateDB(self, game, dbLobby, state):
		if game.player1Token == self.user_id:
			dbLobby.player1Ready = state
			await self.groupSend('log', f'Player 1 ready: {state}!')
		elif game.player2Token == self.user_id:
			dbLobby.player2Ready = state
			await self.groupSend('log', f'Player 2 ready: {state}!')
		else:
			return False

		await database_sync_to_async(dbLobby.save)()

	async def saveChatMessageDB(self, payload):
		lobby = await database_sync_to_async(Lobby.objects.get)(lobby_id=self.lobby_id)
		sender = payload.get('sender')
		if sender and sender != "connect" and sender != "disconnect":
			message = await database_sync_to_async(LobbyChatMessage.objects.create)(sender=payload['sender'], content=payload['content'])
		else:
			return
		await database_sync_to_async(lobby.chat.add)(message)

	@database_sync_to_async
	def updateWinnerDB(self, username):
		try:
			user = User.objects.get(username=username)
			lobby = Lobby.objects.get(lobby_id=self.lobby_id)
			lobby.winner = user
			lobby.save()

			tournaments = Tournament.objects.filter(game1=lobby) | Tournament.objects.filter(game2=lobby) | Tournament.objects.filter(game3=lobby)
			if tournaments.exists():
				for tournament in tournaments:
					tournament.save()
		except User.DoesNotExist:
			print("User does not exist!", flsuh=True)
		except Lobby.DoesNotExist:
			print("Lobby does not exist!", flsuh=True)

	@database_sync_to_async
	def setReturningDB(self, username, state):
		try:
			user = User.objects.get(username=username)
			lobby = Lobby.objects.get(lobby_id=self.lobby_id)
			tournaments = Tournament.objects.filter(game1=lobby) | Tournament.objects.filter(game2=lobby) | Tournament.objects.filter(game3=lobby)
			if tournaments.exists():
				for tournament in tournaments:
					t_player = TournamentPlayer.objects.get(tournament=tournament, player=user)
					t_player.is_returning = state
					t_player.save()
		except Exception as e:
			print(f"Set retuning error: {e}", flush=True)

	@database_sync_to_async
	def createMatchHistory(self, game, lobby_id, winner_username):
		try:
			lobby = Lobby.objects.get(lobby_id=lobby_id)
			if lobby.g1.exists() or lobby.g2.exists() or lobby.g3.exists():
				return
			match = MatchHistory.objects.create(game_id=lobby_id, winner=winner_username, player1Score=game.player1Score, player2Score=game.player2Score, date=now())
			for user in lobby.users.all():
				match.users.add(user)
		except MatchHistory.DoesNotExist:
			print(f"{lobby_id} MatchHistory does not exist", flush=True)
		except Lobby.DoesNotExist:
			print(f"{lobby_id} does not exist", flush=True)
		except Exception as e:
			print(f"Other Error: {e}", flush=True)