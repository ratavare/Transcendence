from django.contrib.auth.models import User
from django.db import models

class Conversation(models.Model):
	participants = models.ManyToManyField(User, related_name="conversations")  # Users in this conversation
	created_at = models.DateTimeField(auto_now_add=True)  # When the conversation was created
	updated_at = models.DateTimeField(auto_now=True)  # Last updated when a new message is sent

	def __str__(self):
		return f"Conversation between: {', '.join(user.username for user in self.participants.all())}"


class Message(models.Model):
	conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")  # Messages belong to a conversation
	sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")  # The user who sent the message
	content = models.TextField()  # Message content
	timestamp = models.DateTimeField(auto_now_add=True)  # When the message was sent
	is_read = models.BooleanField(default=False)  # Whether the recipient(s) have read the message

	def __str__(self):
		return f"Message from {self.sender.username} in Conversation {self.conversation.id}"