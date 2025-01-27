from rest_framework import serializers
from .models import Tournament, TournamentPlayer
from lobby.serializers import UserSerializer, LobbySerializer

class TournamentSerializer(serializers.ModelSerializer):
	players = serializers.SerializerMethodField()
	lobbies = LobbySerializer(read_only=True)

	class Meta:
		model = Tournament
		fields = ['tournament_id', 'players', 'lobbies', 'winner']

	def get_players(self, obj):
		return [
			{"id": tp.player.id, "username": tp.player.username, "joined_at": tp.joined_at}
			for tp in TournamentPlayer.objects.filter(tournament=obj).order_by("joined_at")
		]
