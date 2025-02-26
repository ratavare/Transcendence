import json, asyncio
from tournament.models import Tournament, TournamentPlayer
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

tournaments = {}
deleteTimers = {}

class TournamentConsumer(AsyncWebsocketConsumer):
	tournaments_lock = asyncio.Lock()
	delete_timers_lock = asyncio.Lock()

	async def connect(self):
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		self.user = self.scope["user"]
		self.username = self.user.username
		self.is_returning = False
		self.user_id =  str(self.user.id)

		t_exists = await self.tournamentExistsDB(self.tournament_id)
		print(f"⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n{t_exists}\nTournament_id: {self.tournament_id}\n{self.user.is_authenticated}\n⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n", flush=True)
		if not self.user.is_authenticated or not t_exists:
			print(f"⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\nCLOSE\n⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️", flush=True)
			await self.close()
			return

		async with self.tournaments_lock:
			if self.tournament_id not in tournaments:
				tournaments[self.tournament_id] = {"players": {}, "spectators": {}, "pong_players": {}}

		async with self.delete_timers_lock:
			if self.user_id in deleteTimers:
				deleteTimers[self.user_id].cancel()
				del deleteTimers[self.user_id]

		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		async with self.tournaments_lock:
			tournament = tournaments[self.tournament_id]

		self.is_returning = await self.checkReturningDB()
		await self.playerSetup()
	
		await self.groupSend("message", {
			"sender": "returning",
			"content": f"{self.is_returning}",
		})

		try:
			async with self.tournaments_lock:
				if list(tournament["players"]).index(self.user_id) == 0:
					await self.sendMessage("startBtnInit", "startBtnInit")
		except Exception as e:
			print("ERROR: ", e, flush=True)

		async with self.tournaments_lock:
			await self.groupSend("updateBracketWS", {
				"players": tournament["players"],
				"spectators": tournament["spectators"]
			})

		if self.is_returning:
			self.is_returning = False
			await self.returningUpdateStatus(self.username, self.tournament_id, False)

	async def playerSetup(self):
		async with self.tournaments_lock:
			tournament = tournaments[self.tournament_id]
			if not tournament:
				return

			if self.is_returning or self.user_id in tournament["pong_players"]:
				tournament["players"][self.user_id] = self.username
				if self.user_id in tournament["pong_players"]:
					del tournament["pong_players"][self.user_id]
				sender = "connect"
				content = f"welcome back {self.username}"
			elif len(tournament["players"]) < 4 and self.user_id not in tournament["players"]:
				tournament["players"][self.user_id] = self.username
				sender = "connect"
				content = f"Welcome to the tournament {self.username}!"
			else:
				tournament["spectators"][self.user_id] = self.username
				sender = "spectator"
				content = f"Welcome to the tournament as a spectator {self.username}!"
		await self.groupSend("message", {
			"sender": sender,
			"content": content,
		})

	async def disconnect(self, close_code):

		print(f"❌❌❌❌❌❌❌❌❌❌\n❌❌❌❌❌❌❌❌❌❌\n", flush=True)
		await self.groupSend("message", {
			"sender": "disconnect",
			"content": f"{self.username} is diconnecting..." ,
		})
		async with self.tournaments_lock:
			tournament = tournaments[self.tournament_id]
			if not tournament:
				return
			if self.user_id in tournament["players"]:
				del tournament["players"][self.user_id]
			if self.user_id in tournament["spectators"]:
				del tournament["spectators"][self.user_id]

		async with self.delete_timers_lock:
			if self.user_id not in deleteTimers:
				deleteTimers[self.user_id] = asyncio.create_task(self.deleteTournamentTask(self.tournament_id, self.username))

		await self.channel_layer.group_discard(self.tournament_id, self.channel_name)

	async def deleteTournamentTask(self, t_id, username):
		await asyncio.sleep(4)

		async with self.tournaments_lock:
			tournament = tournaments[t_id]
			if not tournament:
				return
			
			self.is_returning = await self.checkReturningDB()
			await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{username} deleteTournamentTask | return: {self.is_returning}" ,
			})
			print(f"❌❌❌❌❌❌❌❌❌❌\n{not tournament['players']}\n{self.is_returning}\n{not tournament['pong_players']}\n{not tournament['players'] and not tournament['pong_players']}\n❌❌❌❌❌❌❌❌❌❌\n", flush=True)
			if not tournament["players"] and not tournament["pong_players"] and not self.is_returning:
				del tournaments[t_id]
				await self.deleteTournamentDB(t_id)
			elif self.is_returning:
				await self.groupSend("message", {
					"sender": "disconnect",
					"content": f"{username} left for a game!" ,
				})
			else:
				await self.groupSend("message", {
					"sender": "disconnect",
					"content": f"{username} was removed from DB!" ,
				})
				await self.handleStillActive(t_id, tournament, username)

		async with self.tournaments_lock:
			if self.user_id in deleteTimers:
				deleteTimers.pop(self.user_id, None)

	async def handleStillActive(self, t_id, tournament, username):
		await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{username} left the lobby!",
		})
		await self.removePlayerDB(t_id, username)
		await self.groupSend("updateBracketWS", {
			"players": tournament["players"],
		})

	@database_sync_to_async
	def deleteTournamentDB(self, t_id):
		try:
			dbTournament = Tournament.objects.get(tournament_id=t_id)
			dbTournament.delete()
		except Tournament.DoesNotExist:
			pass
	
	@database_sync_to_async
	def removePlayerDB(self, t_id, username):
		try:
			dbTournament = Tournament.objects.get(tournament_id=t_id)
			user = User.objects.get(username=username)
			TournamentPlayer.objects.filter(tournament=dbTournament, player=user).delete()
		except Exception as e:
			print(f"⚠️{e}", flush=True)


	async def receive(self, text_data):
		t_id = self.tournament_id
		tournament = tournaments[t_id]
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

				await self.gameStart(t_id)
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
		except Exception:
			print()
			return False
		return tPlayer.is_returning

	async def gameStart(self, t_id):
		tournament = tournaments[t_id]
		if not tournament:
			return

		for player in tournament["players"]:
			username = tournament["players"][player]
			tournament["pong_players"][player] = username
			await self.returningUpdateStatus(username, t_id, True)
		await self.groupSend("startGame", {
			"players": tournament["players"],
			"tournament_id": t_id
		})

	@database_sync_to_async
	def returningUpdateStatus(self, username, t_id, status):
		t = Tournament.objects.get(tournament_id=t_id)
		p = User.objects.get(username=username)
		tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
		tPlayer.update(is_returning=status)

	@database_sync_to_async
	def tournamentExistsDB(self, t_id):
		try:
			tournament = Tournament.objects.get(tournament_id=t_id)
		except Tournament.DoesNotExist:
			return False
		return True