from django.db import models
from django.contrib.auth.models import User
from lobby.models import Lobby
from django.utils.timezone import now

class Tournament(models.Model):
	tournament_id = models.CharField(max_length=25, unique=True)
	players = models.ManyToManyField(User, through="TournamentPlayer")
	game1 = models.OneToOneField(Lobby, on_delete=models.CASCADE, related_name="g1", null=True, blank=True)
	game2 = models.OneToOneField(Lobby, on_delete=models.CASCADE, related_name="g2", null=True, blank=True)
	game3 = models.OneToOneField(Lobby, on_delete=models.CASCADE, related_name="g3", null=True, blank=True)

	def delete(self, *args, **kwargs):
		if self.game1:
			self.game1.delete()
		if self.game2:
			self.game2.delete()
		if self.game3:
			self.game3.delete()
		super().delete(*args, **kwargs)

class TournamentPlayer(models.Model):
	tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
	player = models.ForeignKey(User, on_delete=models.CASCADE)
	joined_at = models.DateTimeField(default=now)
	is_returning = models.BooleanField(default=False)

	class Meta:
		ordering = ["joined_at"]
