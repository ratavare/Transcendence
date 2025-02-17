import json, asyncio
from tournament.models import Tournament, TournamentPlayer
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

tournaments = {}
deleteTimers = {}

class TournamentConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		self.user = self.scope["user"]
		self.username = self.user.username
		self.is_returning = False

		if not self.user.is_authenticated:
			await self.close()
			return

		if self.tournament_id not in tournaments:
			tournaments[self.tournament_id] = {"players": dict(), "spectators": dict(), "disconnecting_players": dict()}

		token = (self.scope["query_string"].decode()).split("=")[1]
		self.user_id = token if token else self.channel_name

		if self.user_id in deleteTimers:
			deleteTimers[self.user_id].cancel()
			del deleteTimers[self.user_id]

		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		if not token:
			await self.sendMessage("token", self.user_id)

		tournament = tournaments[self.tournament_id]
	
		self.is_returning = await self.checkReturningDB()
	
		await self.groupSend("message", {
			"sender": self.username,
			"content": f"Is returning: {self.is_returning}",
		})

		if self.is_returning or self.user_id in tournament["players"]:
			tournament["players"][self.user_id] = {"username": self.username ,"status": "active"}
			sender = "connect"
			content = f"welcome back {self.username}"
		elif len(tournament["players"]) < 4:
			tournament["players"][self.user_id] = {"username": self.username ,"status": "active"}
			sender = "connect"
			content = f"Welcome to the tournament {self.username}!"
		else:
			tournament["spectators"][self.user_id] = {"username": self.username ,"status": "active"}
			sender = "spectator"
			content = f"Welcome to the tournament as a spectator {self.username}!"

		await self.groupSend("message", {
			"sender": sender,
			"content": content,
		})

		try:
			if list(tournament["players"]).index(self.user_id) == 0:
				await self.sendMessage("startBtnInit", "startBtnInit")
		except Exception as e:
			print("ERROR: ", e, flush=True)

		await self.groupSend("updateBracketWS", {
			"players": tournament["players"],
			"spectators": tournament["spectators"]
		})

		if self.is_returning:
			await self.returningUpdateStatus(False)

	async def disconnect(self, close_code):
		tournament = tournaments.get(self.tournament_id)
		if not tournament:
			return
	
		if self.user_id in tournament["players"]:
			tournament["players"][self.user_id] = {"username": self.username ,"status": "disconnecting"}
		if self.user_id in tournament["spectators"]:
			tournament["spectators"][self.user_id] = {"username": self.username ,"status": "disconnecting"}
	
		if self.user_id not in deleteTimers:
			deleteTimers[self.user_id] = asyncio.create_task(self.deleteTournamentTask(self.tournament_id, self.username))

		await self.channel_layer.group_discard(self.tournament_id, self.channel_name)

	async def deleteTournamentTask(self, tournament_id, username):
		await asyncio.sleep(4)

		tournament = tournaments.get(tournament_id)
		if not tournament:
			return
		
		self.is_returning = await self.checkReturningDB()

		await self.groupSend("log", f"Players: {tournament['players']}")
		await self.groupSend("log", f"Spectator: {tournament['spectators']}")

		activePlayers = [p for p, info in tournament["players"].items() if info["status"] != "disconnecting"]

		if not activePlayers:
			del tournaments[tournament_id]
			await self.deleteTournamentDB(tournament_id)
		elif self.is_returning:
			await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{username} left for a game!" ,
			})
		else:
			await self.handleStillActive(tournament_id, username)
			await self.groupSend("log", f"Player {username} removed from DB")
		
		if self.user_id in deleteTimers:
			deleteTimers.pop(self.user_id, None)

	async def handleStillActive(self, tournament_id, username):
		tournament = tournaments.get(tournament_id)

		if self.user_id in tournament["players"]:
			del tournament["players"][self.user_id]
		if self.user_id in tournament["spectators"]:
			del tournament["spectators"][self.user_id]

		await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{username} left the lobby!",
		})
		
		await self.removePlayerDB(tournament_id, username)

		tournament = tournaments.get(tournament_id)
		await self.groupSend("updateBracketWS", {
			"players": tournament["players"],
		})

	@database_sync_to_async
	def deleteTournamentDB(self, tournament_id):
		try:
			dbTournament = Tournament.objects.get(tournament_id=tournament_id)
			dbTournament.delete()
		except Tournament.DoesNotExist:
			pass
	
	@database_sync_to_async
	def removePlayerDB(self, tournament_id, username):
		try:
			dbTournament = Tournament.objects.get(tournament_id=tournament_id)
			user = User.objects.get(username=username)
			TournamentPlayer.objects.filter(tournament=dbTournament, player=user).delete()
		except Exception as e:
			print("", flush=True)


	async def receive(self, text_data):
		tournament = tournaments.get(self.tournament_id)
		try:
			data = json.loads(text_data)
			send_type = data.get("type")
			payload = data.get("payload")

			if (send_type == "startGames"):
				if len(tournament['players']) < 4:
					await self.groupSend("message", {
						"sender": "disconnect",
						"content": "Tournament not full yet! Waiting for players...",
					})
					return

				await self.gameStart()
				return

			await self.groupSend(send_type, payload)

		except Exception as e:
			await self.sendMessage("log", f"Type and Payload keys are required: {e}")

	async def groupSend(self, send_type, payload):
		await self.channel_layer.group_send(
			self.tournament_id,
			{
				"type": "sendTournament",
				"send_type": send_type,
				"payload": payload
			}
		)

	async def sendTournament(self, event):
		await self.sendMessage(event["send_type"], event["payload"])

	async def sendMessage(self, send_type, payload):
		await self.send(text_data=json.dumps({"type": send_type, "payload": payload}))

	@database_sync_to_async
	def checkReturningDB(self):
		try:
			user = User.objects.get(username=self.username)
			tournament = Tournament.objects.get(tournament_id=self.tournament_id)
			tPlayer = TournamentPlayer.objects.get(tournament=tournament, player=user)
		except Tournament.DoesNotExist:
			print("Tournament.DoesNotExist!!!!!!!!!!!!!!!!!!!!!!!!", flush=True)
			return False
		except User.DoesNotExist:
			print("User.DoesNotExist!!!!!!!!!!!!!!!!!!!!!!!!", flush=True)
			return False
		except TournamentPlayer.DoesNotExist:
			print("TournamentPlayer.DoesNotExist!!!!!!!!!!!!!!!!!!!!!!!!", flush=True)
			return False
		return tPlayer.is_returning

	async def gameStart(self):
		tournament = tournaments.get(self.tournament_id)
		await self.returningUpdateStatus(True)
		await self.groupSend("startGame", {
			"players": tournament["players"],
			"tournament_id": self.tournament_id
		})

	@database_sync_to_async
	def returningUpdateStatus(self, status):
		t = Tournament.objects.get(tournament_id=self.tournament_id)
		p = User.objects.get(username=self.username)
		tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
		tPlayer.update(is_returning=status)
