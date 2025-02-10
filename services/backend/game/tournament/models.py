from django.db import models
from django.contrib.auth.models import User
from lobby.models import Lobby
from django.utils.timezone import now

class Tournament(models.Model):
	tournament_id = models.CharField(max_length=25, unique=True)
	players = models.ManyToManyField(User, through="TournamentPlayer")
	game1 = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name="Semifinal1", null=True, blank=True)
	game2 = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name="Semifinal2", null=True, blank=True)
	game3 = models.ForeignKey(Lobby, on_delete=models.CASCADE, related_name="Final", null=True, blank=True)

class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
	player = models.ForeignKey(User, on_delete=models.CASCADE)
	joined_at = models.DateTimeField(default=now)

	class Meta:
		ordering = ["joined_at"]
