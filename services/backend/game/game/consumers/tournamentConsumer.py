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
			tournaments[self.tournament_id] = {"players": OrderedDict()}
		elif self.tournament_id in deleteTimers:
			deleteTimers[self.tournament_id].cancel()
			del deleteTimers[self.tournament_id]

		token = (self.scope["query_string"].decode()).split('=')[1]
		self.user_id = token if token else self.channel_name

		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		await self.sendMessage('log', f"Welcome to the tournament {self.username}!")
		if not token:
			await self.sendMessage('token', self.user_id)

		tournament = tournaments[self.tournament_id]

		tournament["players"][self.user_id] = self.username

		await self.groupSend('bracketInitWs', {
			'players': tournament["players"],
		})

	async def disconnect(self, close_code):
		tournament = tournaments.get(self.tournament_id)

		if tournament and self.user_id in tournament["players"]:
			tournament["players"][self.user_id] = None
		
		if self.tournament_id not in deleteTimers:
			deleteTimers[self.tournament_id] = asyncio.create_task(self.deleteTournamentTask(tournament))

	async def deleteTournamentTask(self, tournament):
		await asyncio.sleep(4)

		if tournament["players"].get(self.user_id) is None:
			del tournament["players"][self.user_id]
		if not tournament["players"]:
			del tournaments[self.tournament_id]
			await self.deleteTournamentDb()
		else:
			await self.groupSend('log', f'{self.user_id} left the tournament')

		await self.removePlayer(self.username)
		await self.groupSend('bracketInitWs', {
			'players': tournament["players"],
		})
		await self.channel_layer.group_discard(self.tournament_id, self.channel_name)

	async def deleteTournamentDb(self):
		try:
			dbTournament = await database_sync_to_async(Tournament.objects.get)(tournament_id=self.tournament_id)
			await database_sync_to_async(dbTournament.delete)()
		except Tournament.DoesNotExist:
			print(f"Tournament {self.tournament_id} does not exist in the database", flush=True)
			await self.sendMessage('log', "Tournament does not exist")
	
	@database_sync_to_async
	def removePlayer(self, username):
		try:
			dbTournament = Tournament.objects.get(tournament_id=self.tournament_id)
			user = User.objects.get(username=username)
			TournamentPlayer.objects.filter(tournament=dbTournament, player=user).delete()
		except Exception as e:
			print(f'Error removing player {username}: {e}', flush=True)

	async def receive(self, text_data):
		try:
			data = json.loads(text_data)
			send_type = data.get('type')
			payload = data.get('payload')

			await self.groupSend(send_type, payload)

		except:
			await self.sendMessage('log', 'Type and Payload keys are required!')

	async def groupSend(self, send_type, payload):
		await self.channel_layer.group_send(
			self.tournament_id,
			{
				'type': 'sendTournament',
				'send_type': send_type,
				'payload': payload
			}
		)

	async def sendTournament(self, event):
		await self.sendMessage(event['send_type'], event['payload'])

	async def sendMessage(self, send_type, payload):
		await self.send(text_data=json.dumps({'type': send_type, 'payload': payload}))