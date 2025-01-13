import json
from tournament.models import Tournament
from lobby.models import Message
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

tournaments = {}

class TournamentConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.tournament_id = self.scope["url_route"]["kwargs"]["tournament_id"]
		print('Tournamenti Id: ', self.tournament_id, flush=True)

		if self.tournament_id not in tournaments:
			tournaments[self.tournament_id] = {"players": list()}

		token = (self.scope["query_string"].decode()).split('=')[1]
		print('TOKEN: ', token, flush=True)
		self.user_id = token if token else self.channel_name

		await self.channel_layer.group_add(self.tournament_id, self.channel_name)
		await self.accept()

		await self.sendMessage('log', f"Welcome to the tournament {self.user_id}!")
		if not token:
			await self.sendMessage('token', self.user_id)

		tournament = tournaments[self.tournament_id]
		tournament["players"].append(self.user_id)

	async def disconnect(self, close_code):
		tournament = tournaments.get(self.tournament_id)

		if tournament and self.user_id in tournament["players"]:
			tournament["players"].remove(self.user_id)

		if not tournament["players"]:
			del tournaments[self.tournament_id]
			await self.deleteLobbyDb()
		else:
			await self.groupSend('log', f'{self.user_id} left the lobby')
		await self.channel_layer.group_discard(self.tournament_id, self.channel_name)

	async def deleteLobbyDb(self):
		try:
			dbTournament = await database_sync_to_async(Tournament.objects.get)(lobby_id=self.tournament_id)
			await database_sync_to_async(dbTournament.delete)()
		except Tournament.DoesNotExist:
			print(f"Lobby {self.tournament_id} does not exist in the database", flush=True)
			await self.sendMessage('log', "Lobby does not exist")

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