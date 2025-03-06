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
			print("Closing Connection", flush=True)
			await self.close()
			return

		# Set dictionaries
		async with self.tournaments_lock:
			if self.tournament_id not in tournaments:
				tournaments[self.tournament_id] = {"players": {}, "spectators": {}, "pong_players": {}, "ready_players": {}, "winner1": None, "winner2": None, "winner3": None}
		
		tournament = tournaments[self.tournament_id]

		await self.connectTimerDeletion()
		await self.handlePreviousConnections()
		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		# Set players and spectators
		self.is_returning = await self.is_returningDB()
		await self.playerSetup()
	
		# Set tournament winners, remove losers and set them as spectators
		await self.setWinners(self.tournament_id)
		await self.removeLosers(self.tournament_id)

		# Set ready button
		await self.setReadyBtn(tournament)

		# Update bracket
		await self.sendBracketUpdate(tournament)

		# Reset is_returning status
		self.is_returning = False
		await self.setReturningStateDB(self.username, self.tournament_id, False)

	async def connectTimerDeletion(self):
		async with self.delete_timers_lock:
			if self.user_id in deleteTimers:
				deleteTimers[self.user_id].cancel()
				del deleteTimers[self.user_id]

	async def handlePreviousConnections(self):
		if self.tournament_id not in connections:
			connections[self.tournament_id] = {}

		if self.user_id in connections[self.tournament_id]:
			connected_channel_name = connections[self.tournament_id].pop(self.user_id)
			await self.channel_layer.send(connected_channel_name, {"type": "force_disconnect"})

		connections[self.tournament_id][self.user_id] = self.channel_name
	
	async def playerSetup(self):
		async with self.tournaments_lock:
			tournament = tournaments[self.tournament_id]
			if not tournament:
				return
			
			# if player is in tournament["pong_players"] BUT not in DB (in_game), force disconnect
			#Do this periodically AND when a player comes back from pong

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

	@database_sync_to_async
	def setWinners(self, t_id):
		tournament = tournaments[t_id]
		tournamentObject = Tournament.objects.get(tournament_id=t_id)
		tournament["winner1"] = tournamentObject.game1.winner
		tournament["winner2"] = tournamentObject.game2.winner
		tournament["winner3"] = tournamentObject.game3.winner

	async def removeLosers(self, t_id):
		async with self.tournaments_lock:
			tournament = tournaments[t_id]
			username = str(self.username).strip()
			if (tournament["winner1"] != None or tournament["winner2"] != None or tournament["winner3"] != None):
				w1 = self.getWinnerUsername(tournament["winner1"])
				w2 = self.getWinnerUsername(tournament["winner2"])
				w3 = self.getWinnerUsername(tournament["winner3"])
				if (w1 != username and w2 != username and w3 != username):
					del tournament["players"][self.user_id]
					tournament["spectators"][self.user_id] = username

	async def setReadyBtn(self, tournament):
		self.is_ready = await self.is_readyDB()
		await self.sendMessage("readyBtnInit", {
			"winner1": self.getWinnerUsername(tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["winner2"]),
			"winner3": self.getWinnerUsername(tournament["winner3"]),
			"is_ready": self.is_ready,
			"stage": self.getStage(tournament["winner1"], tournament["winner2"], tournament["winner3"])
		})

	def getStage(self, winner1, winner2, winner3):
		if winner3:
			return "winner"
		if winner1 or winner2:
			return "final"
		return "semifinals"

	def getWinnerUsername(self, winner):
		return winner.username if winner and hasattr(winner, 'username') else None

	async def sendBracketUpdate(self, tournament):
		playersToFillBracket = await self.getPlayerNamesDB(self.tournament_id)
		if playersToFillBracket is None:
			playersToFillBracket = tournament["players"]
		
		await self.groupSend("updateBracketWS", {
			"stage": None,
			"state": "connect",
			"players": playersToFillBracket,
			"winner1": self.getWinnerUsername(tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["winner2"]),
			"winner3": self.getWinnerUsername(tournament["winner3"]),
			"spectators": tournament["spectators"],
		})

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

			w1_username = self.getWinnerUsername(tournament["winner1"])
			w2_username = self.getWinnerUsername(tournament["winner2"])
	
			self.is_returning = await self.is_returningDB()
			if self.is_returning:
				await self.groupSend("message", {
					"sender": "disconnect",
					"content": f"{username} left for a game!" ,
				})
			else:
				try:
					if w1_username != None and w2_username != None and (str(w1_username).strip() == str(username).strip() or str(w2_username).strip() == str(username).strip()):
						await self.setFinalWinnerDB(tournament, t_id)
					await self.handlePlayersLeaving(tournament, username)
					await self.removePlayerDB(t_id, username)

				except Exception as e:
					print(f"Unexpected error: {e}", flush=True)

			if not tournament["players"] and not tournament["pong_players"] and not self.is_returning:
				del tournaments[t_id]
				await self.deleteTournamentDB(t_id)

		deleteTimers.pop(self.user_id, None)

	async def force_disconnect(self, event):
		await self.close()

	async def handlePlayersLeaving(self, tournament, username):
		player_names = await self.getPlayerNamesDB(self.tournament_id)
		await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{username} left the tournament!",
		})
		await self.groupSend("updateBracketWS", {
			"state": "disconnect",
			"winner1": self.getWinnerUsername(tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["winner2"]),
			"winner3": self.getWinnerUsername(tournament["winner3"]),
			"players": tournament["players"],
			"player_names": player_names,
			"spectators": tournament["spectators"],
			"stage": self.getStage(tournament["winner1"], tournament["winner2"], tournament["winner3"]),
		})
		if self.user_id in tournament["pong_players"]:
			del tournament["pong_players"][self.user_id]

	@database_sync_to_async
	def deleteTournamentDB(self, t_id):
		try:
			tournament = Tournament.objects.get(tournament_id=t_id)
			tournament.delete()
		except Tournament.DoesNotExist:
			print("Tournament does not Exist", flush=True)
	
	@database_sync_to_async
	def removePlayerDB(self, t_id, username):
		tournament = Tournament.objects.get(tournament_id=t_id)
		user = User.objects.get(username=username)
		TournamentPlayer.objects.filter(tournament=tournament, player=user).delete()
		tournament.players.remove(user)

	async def receive(self, text_data):
		t_id = self.tournament_id
		tournament = tournaments[t_id]
		try:
			data = json.loads(text_data)
			send_type = data.get("type")
			payload = data.get("payload")

			if (send_type == "ready"):
				print("\n", send_type, payload["stage"], "\n", flush=True)
				if payload["stage"] == "semifinals":
					await self.semiFinalsUpdateReady(t_id, tournament)
				if (payload["stage"] == "final"):
					await self.finalsUpdateReady(t_id, tournament)
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

	async def semiFinalsUpdateReady(self, t_id, tournament):
		if self.user_id in tournament["players"] and self.user_id not in tournament["ready_players"]:
			tournament["ready_players"][self.user_id] = self.username
			await self.setReturningStateDB(self.username, t_id, True)
			await self.groupSend("message", {
				"sender": "connect",
				"content": f"{self.username} is ready!"
			})

		if len(tournament['ready_players']) == 4:
			await self.countdown()
			await self.startStage(t_id, "startSemifinals", False)
			await self.lockPlayersDB(tournament, t_id)
	
	async def finalsUpdateReady(self, t_id, tournament):
		if self.user_id in tournament["players"] and self.user_id not in tournament["ready_players"]:
			tournament["ready_players"][self.user_id] = self.username
			await self.setReturningStateDB(self.username, t_id, True)
			await self.groupSend("message", {
				"sender": "connect",
				"content": f"{self.username} is ready!"
			})
		if len(tournament['ready_players']) == 2:
			await self.countdown()
			await self.startStage(t_id, "startFinal", True)

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

	async def startStage(self, t_id, stage, readyState):
		tournament = tournaments[t_id]
		if not tournament:
			return

		await self.groupSend(stage, {
			"players": tournament["ready_players"],
			"tournament_id": t_id
		})

		for player in tournament["players"]:
			if player in tournament["ready_players"]:
				del tournament["ready_players"][player]
			username = tournament["players"][player]
			tournament["pong_players"][player] = username
			await self.setReturningStateDB(username, t_id, True)
			await self.setReadyStateDB(username, t_id, readyState)

	@database_sync_to_async
	def lockPlayersDB(self, tournament, t_id):
		t = Tournament.objects.get(tournament_id=t_id)
		if t.player_names is None:
			t.player_names = []
		for player in tournament["players"]:
			t.player_names.append(tournament["players"][player])
			t.save()

	@database_sync_to_async
	def getPlayerNamesDB(self, t_id):
		t = Tournament.objects.get(tournament_id=t_id)
		return t.player_names

	@database_sync_to_async
	def setReturningStateDB(self, username, t_id, status):
		t = Tournament.objects.get(tournament_id=t_id)
		p = User.objects.get(username=username)
		tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
		tPlayer.update(is_returning=status)
		t.save()

	@database_sync_to_async
	def setReadyStateDB(self, username, t_id, status):
		t = Tournament.objects.get(tournament_id=t_id)
		p = User.objects.get(username=username)
		tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
		tPlayer.update(is_ready=status)
		t.save()

	@database_sync_to_async
	def tournamentExistsDB(self, t_id):
		try:
			tournament = Tournament.objects.get(tournament_id=t_id)
		except Tournament.DoesNotExist:
			return False
		return True
	
	@database_sync_to_async
	def setFinalWinnerDB(self, tournament, t_id):
		try:
			t = Tournament.objects.get(tournament_id=t_id)
			username = list(tournament["players"].values())[0]
			user = User.objects.get(username=username)
			if t.game3:
				final = t.game3
				tournament["winner3"] = user
				final.winner = user
				final.save()
		except Exception as e:
			print(f"setFinalWinnerDB: {e} ", flush=True)

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