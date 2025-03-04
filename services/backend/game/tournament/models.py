from django.db import models
from django.contrib.auth.models import User
from lobby.models import Lobby
from django.utils.timezone import now
from django.contrib.postgres.fields import ArrayField

class Tournament(models.Model):
	tournament_id = models.CharField(max_length=25, unique=True)
	players = models.ManyToManyField(User, through="TournamentPlayer")
	player_names = ArrayField(models.CharField(max_length=25, blank=True), size=4, null=True, blank=True)
	game1 = models.ForeignKey(Lobby, on_delete=models.DO_NOTHING, related_name="g1", null=True, blank=True)
	game2 = models.ForeignKey(Lobby, on_delete=models.DO_NOTHING, related_name="g2", null=True, blank=True)
	game3 = models.ForeignKey(Lobby, on_delete=models.DO_NOTHING, related_name="g3", null=True, blank=True)

	def delete(self, *args, **kwargs):
		game1, game2, game3 = self.game1, self.game2, self.game3
		self.game1 = None
		self.game2 = None
		self.game3 = None
		self.save(update_fields=["game1", "game2", "game3"])  # Ensure changes are persisted
		if game1:
			game1.delete()
		if game2:
			game2.delete()
		if game3:
			game3.delete()
		super().delete(*args, **kwargs)

class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
	player = models.ForeignKey(User, on_delete=models.RESTRICT)
	joined_at = models.DateTimeField(default=now)
	is_returning = models.BooleanField(default=False)
	is_ready = models.BooleanField(default=False)

	class Meta:
		ordering = ["joined_at"]
