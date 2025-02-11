import json, asyncio
from tournament.models import Tournament, TournamentPlayer
from lobby.models import Message
from django.contrib.auth.models import User
from collections import OrderedDict
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

tournaments = {}
deleteTimers = {}

class TournamentConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		self.user = self.scope["user"]
		self.username = self.user.username

		if not self.user.is_authenticated:
			await self.close()
			return

		if self.tournament_id not in tournaments:
			tournaments[self.tournament_id] = {"players": dict(), "spectators": dict(), "fullState": False}
		elif self.tournament_id in deleteTimers:
			deleteTimers[self.tournament_id].cancel()
			del deleteTimers[self.tournament_id]

		token = (self.scope["query_string"].decode()).split("=")[1]
		self.user_id = token if token else self.channel_name

		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		if not token:
			await self.sendMessage("token", self.user_id)

		tournament = tournaments[self.tournament_id]

		if len(tournament["players"]) < 4 and tournament["fullState"] == False:
			tournament["players"][self.user_id] = self.username
			await self.groupSend("message", {
				"sender": "connect",
				"content": f"Welcome to the tournament {self.username}!",
			})
		else:
			tournament["spectators"][self.user_id] = self.username
			await self.groupSend("message", {
				"sender": "spectator",
				"content": f"Welcome to the tournament as a spectator {self.username}!"
			})

		try:
			if list(tournament["players"]).index(self.user_id) == 0:
				await self.sendMessage("startBtnInit", "startBtnInit")
		except Exception as e:
			print("ERROR: ", e, flush=True)

		if len(tournament["players"]) == 4:
			tournament["fullState"] = True

		await self.groupSend("updateBracketWS", {
			"players": tournament["players"],
			"spectators": tournament["spectators"],
			"fullState": tournament["fullState"]
		})

	async def disconnect(self, close_code):
		tournament = tournaments.get(self.tournament_id)

		if tournament and self.user_id in tournament["players"]:
			tournament["players"][self.user_id] = None

		if self.tournament_id not in deleteTimers:
			deleteTimers[self.tournament_id] = asyncio.create_task(self.deleteTournamentTask())

	async def deleteTournamentTask(self):
		await asyncio.sleep(4)

		tournament = tournaments.get(self.tournament_id)
		if not tournament:
			return

		active_players = [p for p in tournament["players"].values() if p not in [None]]

		if not active_players:
			del tournaments[self.tournament_id]
			await self.deleteTournamentDb()
		else:
			await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{self.username} left the lobby!",
			})

		if len(tournament["players"]) < 4:
			tournament["fullState"] = False

		await self.removePlayer(self.username)
		await self.groupSend("updateBracketWS", {
			"players": tournament["players"],
		})
		await self.channel_layer.group_discard(self.tournament_id, self.channel_name)

	async def deleteTournamentDb(self):
		try:
			dbTournament = await database_sync_to_async(Tournament.objects.get)(tournament_id=self.tournament_id)
			await database_sync_to_async(dbTournament.delete)()
		except Tournament.DoesNotExist:
			print(f"Tournament {self.tournament_id} does not exist in the database", flush=True)
			await self.sendMessage("log", "Tournament does not exist")
	
	@database_sync_to_async
	def removePlayer(self, username):
		try:
			dbTournament = Tournament.objects.get(tournament_id=self.tournament_id)
			user = User.objects.get(username=username)
			TournamentPlayer.objects.filter(tournament=dbTournament, player=user).delete()
		except Exception as e:
			print(f"Error removing player {username}: {e}", flush=True)

	async def receive(self, text_data):
		tournament = tournaments.get(self.tournament_id)
		try:
			data = json.loads(text_data)
			send_type = data.get("type")
			payload = data.get("payload")

			if (send_type == "startGames"):

				await self.groupSend("message", {
						"sender": "connect",
						"content": f"${tournament["fullState"]}",
					})
				if tournament['fullState'] == False:
					await self.groupSend("message", {
						"sender": "disconnect",
						"content": "Tournament not full yet! Waiting for players...",
					})
					return

				await self.groupSend("startGame", {
					"players": tournament["players"],
					"tournament_id": self.tournament_id
				})
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