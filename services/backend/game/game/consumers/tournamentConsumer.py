import json, asyncio
from tournament.models import Tournament, TournamentPlayer, TMessage
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
				"fake_names": {},
				"pong_players": {},
				"ready_players": {},
				"spectators": {},
				"winner1": None,
				"winner2": None,
				"winner3": None
			}
		
		tournament = tournaments[self.tournament_id]

		await self.connectTimerDeletion()
		await self.handlePreviousConnections()
		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		# Set players
		username = self.username if self.username not in tournament["fake_names"] else tournament["fake_names"][self.username]
		self.is_returning = await self.is_returningDB()
		connectMessage = await self.playerSetup(tournament, username)
		await self.setFakeNames(tournament)

		# Set tournament winners
		await self.setWinners(self.tournament_id)

		# Set ready button
		await self.setReadyBtn(tournament)

		# Update bracket
		await self.sendBracket(tournament, "players", "connect")
		if connectMessage:
			print("\n Username: ", username, " Spectator:", tournament["spectators"], " Players: ",  tournament["players"], flush=True)
			if username in tournament["spectators"]:
				await self.groupSendChat("spectator", connectMessage)
			else:
				await self.groupSendChat("connect", connectMessage)

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
			await asyncio.sleep(0.1)

		await asyncio.sleep(0.1)
		connections[self.tournament_id][self.user_id] = self.channel_name
	
	async def force_disconnect(self, event):
		await self.close(code=4001)
	
	async def playerSetup(self, tournament, username):
		content = None
		if self.is_returning or self.username in tournament["pong_players"]:
			tournament["players"][self.username] = username
			if self.username in tournament["pong_players"]:
				del tournament["pong_players"][self.username]
			content = f"welcome back {username}"
		elif len(tournament["players"]) < 4 and self.username not in tournament["players"]:
			tournament["players"][self.username] = username
			content = f"Welcome {username}!"
		else:
			tournament["spectators"][self.username] = username
			content = f"Welcome spectator {username}!"
		return content

	async def setFakeNames(self, tournament):
		if self.username in tournament["spectators"]:
			return
		if self.username not in tournament["fake_names"]:
			tournament["fake_names"][self.username] = self.username

	@database_sync_to_async
	def setWinners(self, t_id):
		try:
			tournament = tournaments[t_id]
			tournamentObject = Tournament.objects.get(tournament_id=t_id)
			tournament["winner1"] = tournamentObject.winner1
			tournament["winner2"] = tournamentObject.winner2
			tournament["winner3"] = tournamentObject.winner3
		except Exception as e:
			print(f"\n Set Winners error: {e}", flush=True)

	async def setReadyBtn(self, tournament):
		stage = self.getStage(tournament["winner1"], tournament["winner2"], tournament["winner3"])
		self.is_ready = await self.is_readyDB()
		await self.sendMessage("readyBtnInit", {
			"players": tournament["players"],
			"is_ready": self.is_ready,
			"winner1": self.getWinnerUsername(tournament, 1),
			"winner2": self.getWinnerUsername(tournament, 2),
			"winner3": self.getWinnerUsername(tournament, 3),
			"stage": stage,
		})

	def getStage(self, winner1, winner2, winner3):
		if winner3:
			return "winner"
		if winner1 or winner2:
			return "final"
		return "semifinals"

	def getWinnerUsername(self, tournament, i):
		winner = tournament.get(f"winner{i}")
		returnName = winner if winner not in tournament["fake_names"] or winner is None else tournament["fake_names"][winner]
		return returnName

	async def disconnect(self, close_code):
		if close_code == 4001:
			return

		try:
			tournament = tournaments[self.tournament_id]
		except Exception:
			return

		fake_name = self.username if self.username not in tournament["fake_names"] else tournament["fake_names"][self.username]
		await self.groupSendChat("disconnect", f"{fake_name} is disconnecting...")

		if self.username in tournament["players"]:
			del tournament["players"][self.username]

		if self.user_id not in deleteTimers:
			deleteTimers[self.user_id] = asyncio.create_task(self.deleteTournamentTask(self.tournament_id, self.username, fake_name))

		await self.channel_layer.group_discard(self.tournament_id, self.channel_name)

	async def deleteTournamentTask(self, t_id, username, fake_name):
		await asyncio.sleep(4)

		tournament = tournaments[t_id]
		if not tournament:
			return

		w1_username = self.getWinnerUsername(tournament, 1)
		w2_username = self.getWinnerUsername(tournament, 2)
		w3_username = self.getWinnerUsername(tournament, 3)

		self.is_returning = await self.is_returningDB()
		if self.is_returning:
			await self.groupSendChat("disconnect", f"{fake_name} left for a game!")
			return
		else:
			try:
				self_fake_name = tournament["fake_names"][self.username]
				if w1_username != None and w2_username != None and w3_username == None:
					if w1_username == self_fake_name:
						await self.setFinalWinnerDB(tournament, t_id, w2_username)
					elif w2_username == self_fake_name:
						await self.setFinalWinnerDB(tournament, t_id, w1_username)
					# await self.setReadyBtn(tournament)
				elif w1_username == None and w2_username == None:
					if self.username in tournament["fake_names"]:
						del tournament["fake_names"][self.username]
				await self.handlePlayersLeaving(tournament, fake_name)
				await self.removePlayerDB(t_id, username)

			except Exception as e:
				print(f"Unexpected error: {e}", flush=True)
	
		print("\n", tournament["players"], tournament["pong_players"], "\n", flush=True)
		if not tournament["players"] and not tournament["pong_players"] and not self.is_returning:
			print("\nDELETED TOURNAMENT\n", flush=True)
			del tournaments[t_id]
			await self.deleteTournamentDB(t_id)

		deleteTimers.pop(self.user_id, None)

	async def handlePlayersLeaving(self, tournament, fake_name):
		await self.groupSendChat("disconnect", f"{fake_name} left the tournament!")

		if self.username in tournament["players"]:
			del tournament["players"][self.username]
		if self.username in tournament["ready_players"]:
			del tournament["ready_players"][self.username]
		if self.username in tournament["pong_players"]:
			del tournament["pong_players"][self.username]
	
		await self.sendBracket(tournament, "players", "disconnect")


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
					await self.updateReadyState(t_id, tournament, "players", 4, "startSemifinals", False)
				if (payload["stage"] == "final"):
					await self.updateReadyState(t_id, tournament, "fake_names", 2, "startFinal", True)
				return

			if (send_type == "fakeName"):
				await self.sendFakeNames(payload, tournament)
				return
			
			if (send_type == "message"):
				await self.saveChatMessageDB(payload, t_id, tournament)
				sender = payload["sender"]
				if sender in tournament["fake_names"]:
					payload["sender"] = tournament["fake_names"][sender]
				else:
					payload["sender"] = "spectator"
				
				print("\nPayload: ", payload, '\n', flush=True)

			await self.groupSend(send_type, payload)

		except Exception as e:
			await self.sendMessage("log", f"Type and Payload keys are required: {e}")

	async def sendFakeNames(self, payload, tournament):
		tournament["fake_names"][self.username] = payload
		
		await self.sendBracket(tournament, "fake_names", None)
	
		await self.groupSendChat("changeName", {
			"oldName": self.username,
			"newName": payload,
		})

	async def groupSendChat(self, sender, content):
		await self.groupSend("message", {
			"sender": sender,
			"content": content
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

	# tournamentDictKey should be one of the dicts of tournament (players, fake_names, etc) 
	async def sendBracket(self, tournament, tournamentDictKey, state):
		w1 = self.getWinnerUsername(tournament, 1)
		w2 = self.getWinnerUsername(tournament, 2)
		w3 = self.getWinnerUsername(tournament, 3)
		stage = self.getStage(w1, w2, w3)
		await self.groupSend("updateBracketWS", {
			"state": state,
			"players": tournament[tournamentDictKey],
			"fake_names": tournament["fake_names"],
			"winner1": w1,
			"winner2": w2,
			"winner3": w3,
			"stage": stage,
		})

	async def sendTournament(self, event):
		await self.sendMessage(event["send_type"], event["payload"])

	async def sendMessage(self, send_type, payload):
		await self.send(text_data=json.dumps({"type": send_type, "payload": payload}))

	async def updateReadyState(self, t_id, tournament, tournamentDictKey, playerNumber, send_type, readyState):
		if self.username in tournament[tournamentDictKey] and self.username not in tournament["ready_players"]:
			tournament["ready_players"][self.username] = self.username
			username = self.username if self.username not in tournament["fake_names"] else tournament["fake_names"][self.username]
			await self.groupSendChat("connect", f"{username} is ready!")

		if len(tournament['ready_players']) == playerNumber:
			for player in tournament['ready_players']:
				await self.setReturningStateDB(tournament['ready_players'][player], t_id, True)
			asyncio.create_task(self.countdownAndStart(t_id, tournament, send_type, readyState))
	
	async def countdownAndStart(self, t_id, tournament, send_type, readyState):
		await self.countdown()
		await self.startStage(t_id, tournament, send_type, readyState)

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
		winner1 = self.getWinnerUsername(tournament, 1)
		winner2 = self.getWinnerUsername(tournament, 2)

		if stage == "startSemifinals":
			for player in tournament["players"]:
				await self.handleStartStage(t_id, tournament, player, readyState)
		if stage == "startFinal":
			await self.handleStartStage(t_id, tournament, winner1, readyState)
			await self.handleStartStage(t_id, tournament, winner2, readyState)

		await self.groupSend(stage, {
			"winner1": winner1,
			"winner2": winner2,
			"players": tournament["fake_names"],
			"tournament_id": t_id
		})

	async def handleStartStage(self, t_id, tournament, player, readyState):
		if player in tournament["ready_players"]:
			del tournament["ready_players"][player]
		tournament["pong_players"][self.username] = player
		await self.setReturningStateDB(player, t_id, True)
		await self.setReadyStateDB(player, t_id, readyState) 	

	@database_sync_to_async
	def getPlayerNamesDB(self, t_id):
		t = Tournament.objects.get(tournament_id=t_id)
		return t.player_names

	@database_sync_to_async
	def setReturningStateDB(self, username, t_id, status):
		try:
			t = Tournament.objects.get(tournament_id=t_id)
			p = User.objects.get(username=username)
			tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
			tPlayer.update(is_returning=status)
			t.save()
		except Exception as e:
			print(f"Set returning state DB error: {e}", flush=True)

	@database_sync_to_async
	def setReadyStateDB(self, username, t_id, status):
		try:
			t = Tournament.objects.get(tournament_id=t_id)
			p = User.objects.get(username=username)
			tPlayer = TournamentPlayer.objects.filter(tournament=t, player=p)
			tPlayer.update(is_ready=status)
			t.save()
		except Exception as e:
			print(f"Set returning state DB error: {e}", flush=True)

	@database_sync_to_async
	def tournamentExistsDB(self, t_id):
		try:
			tournament = Tournament.objects.get(tournament_id=t_id)
		except Tournament.DoesNotExist:
			return False
		return True
	
	@database_sync_to_async
	def setFinalWinnerDB(self, tournament, t_id, winnerName):
		try:
			t = Tournament.objects.get(tournament_id=t_id)
			username = self.getKey(tournament["fake_names"], winnerName)
			user = User.objects.get(username=username)
			if t.game3:
				final = t.game3
				tournament["winner3"] = user
				final.winner = user
				final.save()
		except Exception as e:
			print(f"setFinalWinnerDB: {e} ", flush=True)

	def getKey(self, dict, value):
		for key, val, in dict.items():
			if val == value:
				return key
		return None

	async def countdown(self):
		await asyncio.sleep(1)
		await self.groupSendChat("countdown", "Game will start in...")
		for i in range(3, 0, -1):
			await self.groupSendChat("countdown", f"{i}...")
			await asyncio.sleep(1)

	async def saveChatMessageDB(self, payload, t_id, tournament):
		color = payload.get('color')
		sender = payload.get('sender')
		tournamentDB = await database_sync_to_async(Tournament.objects.get)(tournament_id=t_id)
		username = sender if sender not in tournament["fake_names"] else tournament["fake_names"][sender]
		if sender and sender != "connect" and sender != "disconnect" and sender != "countdown" and sender != "changeName":
			message = await database_sync_to_async(TMessage.objects.create)(sender=username, content=payload['content'], color=color)
		else:
			return
		await database_sync_to_async(tournamentDB.chat.add)(message)