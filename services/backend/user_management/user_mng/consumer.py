import json
import asyncio
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth.models import User
from user_friends.models import Friendships

# Maintain a global dictionary of online users
ONLINE_USERS = {}

class OnlineStatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_authenticated:
            self.group_name = f"user_status_{self.user.username}"
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            ONLINE_USERS[self.user.username] = True
            await self.broadcast_status("online")
            await self.send_current_friends_status()

    async def disconnect(self, close_code):
        if self.user.is_authenticated:
            # Remove user from online users
            ONLINE_USERS.pop(self.user.username, None)
            
            # Broadcast offline status
            await self.broadcast_status("offline")
            
            # Remove this channel from the user's group
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """Handle incoming messages, like status fetch requests"""
        data = json.loads(text_data)
        
        if data == "FETCH_STATUS":
            # Send current online status of friends
            await self.send_current_friends_status()

    @sync_to_async
    def get_friends_usernames(self):
        """Retrieve usernames of accepted friends"""
        user = User.objects.get(username=self.user.username)
        friendships = Friendships.objects.filter(from_user=user, status='accepted')
        return [friendship.to_user.username for friendship in friendships]

    async def broadcast_status(self, status):
        """Notify friends about user's status change"""
        usernames = await self.get_friends_usernames()
        for username in usernames:
            await self.channel_layer.group_send(
                f"user_status_{username}",
                {
                    "type": "status_update",
                    "user": self.user.username,
                    "status": status,
                }
            )

    async def status_update(self, event):
        """Send status update to frontend"""
        await self.send(text_data=json.dumps(event))

    async def send_current_friends_status(self):
        """Send current online status of all friends"""
        usernames = await self.get_friends_usernames()
        
        # Collect and send online friends
        online_friends = [
            username for username in usernames 
            if username in ONLINE_USERS
        ]
        
        # Send online friend statuses
        for online_friend in online_friends:
            await self.send(text_data=json.dumps({
                "user": online_friend,
                "status": "online"
            }))