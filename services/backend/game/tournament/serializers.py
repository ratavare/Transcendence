from rest_framework import serializers
from .models import Tournament, TournamentPlayer
from lobby.serializers import UserSerializer, LobbySerializer

class TournamentSerializer(serializers.ModelSerializer):
	players = serializers.SerializerMethodField()
	game1 = LobbySerializer()
	game2 = LobbySerializer()
	game3 = LobbySerializer()

	class Meta:
		model = Tournament
		fields = ['tournament_id', 'players', 'game1', 'game2', 'game3']

	def get_players(self, obj):
		return [
			{"id": tp.player.id, "username": tp.player.username, "joined_at": tp.joined_at}
			for tp in TournamentPlayer.objects.filter(tournament=obj).order_by("joined_at")
		]
