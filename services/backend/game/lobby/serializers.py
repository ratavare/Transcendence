from rest_framework import serializers
from .models import Lobby
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['username']


class LobbySerializer(serializers.ModelSerializer):
	users = UserSerializer(many=True, read_only=True)

	class Meta:
		model = Lobby
		fields = ['lobby_id', 'created_at', 'users']