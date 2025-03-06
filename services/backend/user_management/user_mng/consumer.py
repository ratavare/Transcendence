import json
import asyncio
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from user_friends.models import Friendships

class OnlineStatusConsumer(AsyncWebsocketConsumer):

	async def connect(self):
		self.user = self.scope["user"]
		if self.user.is_authenticated:
			self.group_name = f"user_status_{self.user.username}"
			await self.channel_layer.group_add(self.group_name, self.channel_name)
			await self.accept()
			await self.broadcast_status("online")

	async def receive(self, text_data):
		await self.broadcast_status("online")

	async def disconnect(self, close_code):
		if self.user.is_authenticated:
			await self.broadcast_status("offline")
			await self.channel_layer.group_discard(self.group_name, self.channel_name)

	@sync_to_async
	def getFriendsUsernames(self):
		user = User.objects.get(username=self.user.username)
		friendships = Friendships.objects.filter(from_user=user, status='accepted')
		usernames = [friendship.to_user.username for friendship in friendships]
		return usernames

	async def broadcast_status(self, status):
		usernames = await self.getFriendsUsernames()
		for username in usernames:
			await self.channel_layer.group_send(
				f"user_status_{username}",
				{
					"type": "status_update",
					"user": self.user.username,
					"status": status,
				},
			)

	async def status_update(self, event):
		await self.send(text_data=json.dumps(event))