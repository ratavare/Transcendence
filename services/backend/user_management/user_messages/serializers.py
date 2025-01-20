from rest_framework import serializers
from .models import Message, Conversation
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username']

class MessageSerializer(serializers.ModelSerializer):
	sender = UserSerializer()

	class Meta:
		model = Message
		fields = ['id', 'sender', 'content', 'timestamp', 'is_read']

class ConversationSerializer(serializers.ModelSerializer):
	participants = UserSerializer(many=True)
	messages = MessageSerializer(many=True)

	class Meta:
		model = Conversation
		fields = ['id', 'participants', 'messages', 'updated_at']