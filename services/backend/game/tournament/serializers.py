from rest_framework import serializers
from .models import Tournament
from lobby.serializers import UserSerializer, LobbySerializer

class TournamentSerializer(serializers.ModelSerializer):
	players = UserSerializer(many=True, read_only=True)
	lobbies = LobbySerializer(many=True, read_only=True)

	class Meta:
		model = Tournament
		fields = ['tournament_id', 'players', 'lobbies', 'winner']