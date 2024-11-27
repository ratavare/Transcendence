from rest_framework import serializers
from .models import Lobby

class LobbySerializer(serializers.ModelSerializer):
	class Meta:
		model = Lobby
		fields = ['lobby_id', 'created_at', 'users']