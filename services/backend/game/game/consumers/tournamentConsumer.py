import json, asyncio
from tournament.models import Tournament, TournamentPlayer
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

tournaments = {}
deleteTimers = {}
connections = {}

class TournamentConsumer(AsyncWebsocketConsumer):

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
		if self.tournament_id not in tournaments:
			tournaments[self.tournament_id] = {
				"players": {},
				"spectators": {},
				"real_names": {},
				"fake_names": {},
				"pong_players": {},
				"ready_players": {},
				"winner1": None,
				"winner2": None,
				"winner3": None
			}
		
		tournament = tournaments[self.tournament_id]

		await self.connectTimerDeletion()
		await self.handlePreviousConnections()
		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		# Set players and spectators
		self.is_returning = await self.is_returningDB()
		await self.playerSetup(tournament)
		await self.setFakeNames(tournament)
		print("PLAYERS CONNECT: ", tournament["players"], flush=True)
	
		# Set tournament winners
		await self.setWinners(self.tournament_id)

		# Set ready button
		await self.setReadyBtn(tournament)

		# Update bracket
		await self.connectBracketUpdate(tournament)

		# Reset is_returning status
		self.is_returning = False
		await self.setReturningStateDB(self.username, self.tournament_id, False)

	async def connectTimerDeletion(self):
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
	
	async def playerSetup(self, tournament):
		username = self.username if self.username not in tournament["fake_names"] else tournament["fake_names"][self.username]

		if self.is_returning or self.user_id in tournament["pong_players"]:
			tournament["players"][self.user_id] = username
			if self.user_id in tournament["pong_players"]:
				del tournament["pong_players"][self.user_id]
			sender = "connect"
			content = f"welcome back {username}"
		elif len(tournament["players"]) < 4 and self.user_id not in tournament["players"]:
			tournament["players"][self.user_id] = username
			tournament["real_names"][self.username] = tournament["players"][self.user_id]
			sender = "connect"
			content = f"Welcome {username}!"
		else:
			tournament["spectators"][self.user_id] = username
			sender = "spectator"
			content = f"Welcome to the tournament as a spectator {username}!"
		await self.groupSend("message", {
			"sender": sender,
			"content": content,
		})

	async def setFakeNames(self, tournament):
		if self.username not in tournament["fake_names"]:
			tournament["fake_names"][self.username] = self.username

	@database_sync_to_async
	def setWinners(self, t_id):
		tournament = tournaments[t_id]
		tournamentObject = Tournament.objects.get(tournament_id=t_id)
		tournament["winner1"] = tournamentObject.game1.winner
		tournament["winner2"] = tournamentObject.game2.winner
		tournament["winner3"] = tournamentObject.game3.winner

	# async def removeLosers(self, t_id):
	# 	tournament = tournaments[t_id]
	# 	username = str(self.username).strip()
	# 	if (tournament["winner1"] != None or tournament["winner2"] != None or tournament["winner3"] != None):
	# 		w1 = self.getWinnerUsername(tournament["fake_names"], tournament["winner1"])
	# 		w2 = self.getWinnerUsername(tournament["fake_names"], tournament["winner2"])
	# 		w3 = self.getWinnerUsername(tournament["fake_names"], tournament["winner3"])
	# 		if (w1 != username and w2 != username and w3 != username):
	# 			del tournament["players"][self.user_id]
	# 			tournament["spectators"][self.user_id] = username

	async def setReadyBtn(self, tournament):
		self.is_ready = await self.is_readyDB()
		await self.sendMessage("readyBtnInit", {
			"players": tournament["fake_names"],
			"is_ready": self.is_ready,
			"winner1": self.getWinnerUsername(tournament["real_names"], tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["real_names"], tournament["winner2"]),
			"winner3": self.getWinnerUsername(tournament["real_names"], tournament["winner3"]),
			"stage": self.getStage(tournament["winner1"], tournament["winner2"], tournament["winner3"])
		})

	def getStage(self, winner1, winner2, winner3):
		if winner3:
			return "winner"
		if winner1 or winner2:
			return "final"
		return "semifinals"

	def getWinnerUsername(self, userList, winner):
		wUsername = winner.username if winner and hasattr(winner, 'username') else None
		returnName = wUsername if wUsername not in userList or wUsername is None else userList[wUsername]
		return returnName

	async def connectBracketUpdate(self, tournament):
		await self.groupSend("updateBracketWS", {
			"state": "connect",
			"players": tournament["fake_names"],
			"spectators": tournament["spectators"],
			"winner1": self.getWinnerUsername(tournament["fake_names"], tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["fake_names"], tournament["winner2"]),
			"winner3": self.getWinnerUsername(tournament["fake_names"], tournament["winner3"]),
			"stage": None,
		})

	async def disconnect(self, close_code):
		try:
			tournament = tournaments[self.tournament_id]
		except Exception:
			return

		fake_name = self.username if self.username not in tournament["fake_names"] else tournament["fake_names"][self.username]
		await self.groupSend("message", {
			"sender": "disconnect",
			"content": f"{fake_name} is disconnecting..." ,
		})
		if self.user_id in tournament["players"]:
			del tournament["players"][self.user_id]
		if self.user_id in tournament["spectators"]:
			del tournament["spectators"][self.user_id]

		print("PLAYERS DISCONNECT: ", tournament["players"], flush=True)

		if self.user_id not in deleteTimers:
			deleteTimers[self.user_id] = asyncio.create_task(self.deleteTournamentTask(self.tournament_id, self.username, fake_name))

		await self.channel_layer.group_discard(self.tournament_id, self.channel_name)

	async def deleteTournamentTask(self, t_id, username, fake_name):
		await asyncio.sleep(4)

		tournament = tournaments[t_id]
		if not tournament:
			return

		w1_username = self.getWinnerUsername(tournament["fake_names"], tournament["winner1"])
		w2_username = self.getWinnerUsername(tournament["fake_names"], tournament["winner2"])

		self.is_returning = await self.is_returningDB()
		if self.is_returning:
			await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{fake_name} left for a game!" ,
			})
			return
		else:
			try:
				if w1_username != None and w2_username != None and (str(w1_username).strip() == str(username).strip() or str(w2_username).strip() == str(username).strip()):
					await self.setFinalWinnerDB(tournament, t_id)
				await self.handlePlayersLeaving(tournament, fake_name)
				await self.removePlayerDB(t_id, username)

			except Exception as e:
				print(f"Unexpected error: {e}", flush=True)

		if not tournament["players"] and not tournament["pong_players"] and not self.is_returning:
			print("DELETE TOURNAMENT", flush=True)
			del tournaments[t_id]
			await self.deleteTournamentDB(t_id)

		print("PLAYERS DISCONNECT TASK: ", tournament["players"], flush=True)

		deleteTimers.pop(self.user_id, None)

	async def force_disconnect(self, event):
		await self.close()

	async def handlePlayersLeaving(self, tournament, fake_name):
		stage = self.getStage(tournament["winner1"], tournament["winner2"], tournament["winner3"])

		await self.groupSend("message", {
				"sender": "disconnect",
				"content": f"{fake_name} left the tournament!",
		})

		print("STAGE: ", stage, flush=True)
		if stage is None or stage == "semifinals":
			if self.username in tournament["fake_names"]:
				del tournament["fake_names"][self.username]
			if self.username in tournament["real_names"]:
				del tournament["real_names"][self.username]
		if self.user_id in tournament["players"]:
			del tournament["players"][self.user_id]
	
		await self.groupSend("updateBracketWS", {
			"state": "disconnect",
			"players": tournament["players"],
			"fake_names": tournament["fake_names"],
			"winner1": self.getWinnerUsername(tournament["fake_names"], tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["fake_names"], tournament["winner2"]),
			"winner3": self.getWinnerUsername(tournament["fake_names"], tournament["winner3"]),
			"stage": stage
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
				if payload["stage"] == "semifinals":
					await self.semiFinalsUpdateReady(t_id, tournament)
				if (payload["stage"] == "final"):
					await self.finalsUpdateReady(t_id, tournament)
				return

			if (send_type == "fakeName"):
				await self.sendFakeNames(payload, tournament)
				return
			
			if (send_type == "message"):
				sender = payload["sender"]
				if sender in tournament["fake_names"]:
					payload["sender"] = tournament["fake_names"][sender]

			await self.groupSend(send_type, payload)

		except Exception as e:
			await self.sendMessage("log", f"Type and Payload keys are required: {e}")

	async def sendFakeNames(self, payload, tournament):
		tournament["fake_names"][self.username] = payload
		await self.groupSend("updateBracketWS", {
			"state": None,
			"players": tournament["fake_names"],
			"spectators": tournament["spectators"],
			"winner1": self.getWinnerUsername(tournament["fake_names"], tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["fake_names"], tournament["winner2"]),
			"winner3": self.getWinnerUsername(tournament["fake_names"], tournament["winner3"]),
			"stage": self.getStage(tournament["winner1"], tournament["winner2"], tournament["winner3"]),
		})
		await self.groupSend("message", {
			"sender": "connect",
			"content": f"{self.username} changed his username to {payload}!",
		})

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

			username = self.username if self.username not in tournament["fake_names"] else tournament["fake_names"][self.username]
			await self.groupSend("message", {
				"sender": "connect",
				"content": f"{username} is ready!"
			})

		if len(tournament['ready_players']) == 4:
			await self.countdown()
			await self.startStage(t_id, tournament, "startSemifinals", False)
	
	async def finalsUpdateReady(self, t_id, tournament):
		if self.username in tournament["fake_names"] and self.user_id not in tournament["ready_players"]:
			tournament["ready_players"][self.user_id] = self.username
			await self.setReturningStateDB(self.username, t_id, True)
			await self.groupSend("message", {
				"sender": "connect",
				"content": f"{self.username} is ready!"
			})
		if len(tournament['ready_players']) == 2:
			await self.countdown()
			await self.startStage(t_id, tournament,"startFinal", True)

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

	async def startStage(self, t_id, tournament, stage, readyState):
		await self.groupSend(stage, {
			"winner1": self.getWinnerUsername(tournament["real_names"], tournament["winner1"]),
			"winner2": self.getWinnerUsername(tournament["real_names"], tournament["winner2"]),
			"players": tournament["real_names"],
			"fake_names": tournament["fake_names"],
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