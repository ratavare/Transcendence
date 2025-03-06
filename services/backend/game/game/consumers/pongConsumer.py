
import json, asyncio
from lobby.models import Lobby, Message
from tournament.models import Tournament, TournamentPlayer
from match_history.models import GameHistory
from django.contrib.auth.models import User
from .pongObjects import Pong, vars
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
	
		if self.lobby_id not in lobbies:
			lobbies[self.lobby_id] = {"players": dict(), "gameLoop": None, "game": Pong()}
		elif self.lobby_id in deleteTimers:
			deleteTimers[self.lobby_id].cancel()
			del deleteTimers[self.lobby_id]
		
		lobby = lobbies[self.lobby_id]

		token = (self.scope["query_string"].decode()).split('=')[1]
		self.user_id = token if token else self.channel_name

		if self.lobby_id not in connections:
			connections[self.lobby_id] = {}

		if self.user_id in connections[self.lobby_id]:
			connected_channel_name = connections[self.lobby_id][self.user_id]
			await self.channel_layer.send(connected_channel_name, {"type": "force_disconnect"})
			del connections[self.lobby_id][self.user_id]

		connections[self.lobby_id][self.user_id] = self.channel_name

		await self.channel_layer.group_add(self.lobby_id, self.channel_name)
		await self.accept()
		
		if not token:
			await self.sendMessage('token', self.user_id)

		lobby["players"][self.user_id] = self.username
		
		game = lobby["game"]
		
		await self.setPaddleMovement(game)
		await self.readyState(False)
		await self.graphicsInit()

		if game.running:
			await self.sendMessage('readyBtn', 'add')
		else:
			await self.sendMessage('readyBtn', 'remove')

	async def disconnect(self, close_code):
		lobby = lobbies.get(self.lobby_id)

		if lobby and self.user_id in lobby["players"]:
			del lobby["players"][self.user_id]

		if self.lobby_id not in deleteTimers:
			deleteTimers[self.lobby_id] = asyncio.create_task(self.deleteLobbyTask(lobby))

	async def force_disconnect(self):
		await self.close()

	async def deleteLobbyTask(self, lobby):
		await asyncio.sleep(3)

		print("\nTASK", flush=True)
		if not lobby["players"]:
			print("\nDELETING LOBBY", flush=True)
			await self.deleteLobbyWS(lobby)
			await self.deleteLobbyDB()
		else:
			try:
				print("\nLEAVING LOBBY", flush=True)
				await self.groupSend('log', f'{self.username} left the lobby')
				winner_id = lobby['game'].player1Token if lobby['game'].player1Token is not self.user_id else lobby['game'].player2Token
				winner_username = lobby["players"][winner_id]
				if lobby['game'].running == False:
					await self.groupSend('gameOver', {"winner": winner_username })
					await self.updateWinnerDB(winner_username)
					await self.setReturningDB(self.username, False)
			except Exception as e:
				print(f"Error: {e}", flush=True)

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
					await self.groupSend('gameOver', {"winner": lobby["players"][winner]})
					await self.updateWinnerDb(lobby["players"][winner])
					await self.updateGameHistory()
					break
		except Exception as e:
			await self.sendMessage('log', f'Error is runLoop: {e}')
		finally:
			await self.sendMessage('log', 'Game End')

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
		if payload.get('sender'):
			message = await database_sync_to_async(Message.objects.create)(sender=payload['sender'], content=payload['content'])
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
			print(username, state, "\n",flush=True)
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
