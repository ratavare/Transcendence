import json, asyncio
from tournament.models import Tournament, TournamentPlayer
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

tournaments = {}
deleteTimers = {}
connections = {}

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
		if not self.user.is_authenticated or not t_exists:
			await self.close()
			return

		async with self.tournaments_lock:
			if self.tournament_id not in tournaments:
				tournaments[self.tournament_id] = {"players": {}, "spectators": {}, "pong_players": {}, "ready_players": {}, "winner1": None, "winner2": None, "winner3": None}

		async with self.delete_timers_lock:
			if self.user_id in deleteTimers:
				deleteTimers[self.user_id].cancel()
				del deleteTimers[self.user_id]

		if self.tournament_id not in connections:
			connections[self.tournament_id] = {}

		if self.user_id in connections[self.tournament_id]:
			connected_channel_name = connections[self.tournament_id][self.user_id]
			await self.channel_layer.send(connected_channel_name, {"type": "force_disconnect"})
			del connections[self.tournament_id][self.user_id]

		connections[self.tournament_id][self.user_id] = self.channel_name

		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		self.is_returning = await self.is_returningDB()
		self.is_ready = await self.is_readyDB()
		await self.playerSetup()
		await self.removeLosers(self.tournament_id)

		await self.sendMessage("readyBtnInit", f"{self.is_ready}")

		self.is_returning = False
		await self.setReturningState(self.username, self.tournament_id, False)

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

	async def removeLosers(self, t_id):
		state = False
		async with self.tournaments_lock:
			tournament = tournaments[t_id]
			await self.getWinners(t_id)
			for player in tournament["players"]:
				for i in range(1, 3):
					print("Player: ", tournament["players"][player], " | winner: ", tournament["winner" + str(i)], flush=True)
					if tournament["players"][player] is tournament["winner" + str(i)]:
						state = True
				if state:
					tournament["spectators"][self.user_id] = self.username

	@database_sync_to_async
	def getWinners(self, t_id):
		tournament = tournaments[t_id]
		tournamentObject = Tournament.objects.get(tournament_id=t_id)
		tournament["winner1"] = tournamentObject.game1.winner
		tournament["winner2"] = tournamentObject.game2.winner
		tournament["winner3"] = tournamentObject.game3.winner

	async def disconnect(self, close_code):
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
			
			self.is_returning = await self.is_returningDB()
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

	async def force_disconnect(self, event):
		await self.close()

	async def handleStillActive(self, t_id, tournament, username):
		await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{username} left the tournament!",
		})
		await self.removePlayerDB(t_id, username)
		await self.groupSend("updateBracketWS", {
			"players": tournament["players"],
			"spectators": tournament["spectators"],
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

			if (send_type == "ready"):
				if self.user_id in tournament["players"] and self.user_id not in tournament["ready_players"]:
					tournament["ready_players"][self.user_id] = self.username
					await self.setReadyState(self.username, t_id, True)
					await self.groupSend("message", {
						"sender": "connect",
						"content": f"{self.username} is ready!" 
		 			})
				if len(tournament['ready_players']) == 4:
					await self.countdown()
					await self.startSemifinals(t_id)
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
	def is_returningDB(self):
		try:
			user = User.objects.get(username=self.username)
			tournament = Tournament.objects.get(tournament_id=self.tournament_id)
			tPlayer = TournamentPlayer.objects.get(tournament=tournament, player=user)
		except Exception:
			return False
		return tPlayer.is_returning
	
	@database_sync_to_async
	def is_readyDB(self):
		try:
			user = User.objects.get(username=self.username)
			tournament = Tournament.objects.get(tournament_id=self.tournament_id)
			tPlayer = TournamentPlayer.objects.get(tournament=tournament, player=user)
		except Exception:
			return False
		return tPlayer.is_ready

	async def startSemifinals(self, t_id):
		tournament = tournaments[t_id]
		if not tournament:
			return

		for player in tournament["players"]:
			username = tournament["players"][player]
			tournament["pong_players"][player] = username
			await self.setReturningState(username, t_id, True)

		await self.groupSend("startSemifinals", {
			"players": tournament["players"],
			"tournament_id": t_id
		})

	@database_sync_to_async
	def setReturningState(self, username, t_id, status):
		t = Tournament.objects.get(tournament_id=t_id)
		p = User.objects.get(username=username)
		tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
		tPlayer.update(is_returning=status)

	@database_sync_to_async
	def setReadyState(self, username, t_id, status):
		t = Tournament.objects.get(tournament_id=t_id)
		p = User.objects.get(username=username)
		tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
		tPlayer.update(is_ready=status)

	@database_sync_to_async
	def tournamentExistsDB(self, t_id):
		try:
			tournament = Tournament.objects.get(tournament_id=t_id)
		except Tournament.DoesNotExist:
			return False
		return True

	async def countdown(self):
		await self.groupSend("message", {
				"sender": "connect",
				"content": "Game will start in..."
			})
		for i in range(3, 0, -1):
			await self.groupSend("message", {
				"sender": "connect",
				"content": f"{i}..."
			})
			await asyncio.sleep(1)