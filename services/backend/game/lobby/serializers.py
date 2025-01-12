from rest_framework import serializers
from .models import Lobby, Position, Message
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['username']

class PositionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Position
		fields = ['x', 'z']

class MessageSerializer(serializers.ModelSerializer):
	class Meta:
		model = Message
		fields = ['sender', 'content']

class LobbySerializer(serializers.ModelSerializer):
	users = UserSerializer(many=True, read_only=True)
	ballPosition = PositionSerializer(read_only=True)
	paddle1Position = PositionSerializer(read_only=True)
	paddle2Position = PositionSerializer(read_only=True)
	chat = MessageSerializer(many=True, read_only=True)

	class Meta:
		model = Lobby
		fields = ['lobby_id', 'created_at', 'users', 'gameState', 'player1Score', 'player2Score', 'ballPosition', 'paddle1Position', 'paddle2Position', 'chat']
	