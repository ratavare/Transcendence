from django.db import models
from lobby.models import Lobby
from django.dispatch import receiver
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.db.models.signals import post_save

class TMessage(models.Model):
	sender = models.CharField(max_length=100, blank=True)
	content = models.TextField(blank=True)
	color = models.TextField(max_length=20, blank=True)

class Tournament(models.Model):
	tournament_id = models.CharField(max_length=25, unique=True)
	players = models.ManyToManyField(User, through="TournamentPlayer")
	game1 = models.ForeignKey(Lobby, on_delete=models.SET_NULL, related_name="g1", null=True, blank=True)
	game2 = models.ForeignKey(Lobby, on_delete=models.SET_NULL, related_name="g2", null=True, blank=True)
	game3 = models.ForeignKey(Lobby, on_delete=models.SET_NULL, related_name="g3", null=True, blank=True)
	winner1 = models.CharField(max_length=25, null=True, blank=True)
	winner2 = models.CharField(max_length=25, null=True, blank=True)
	winner3 = models.CharField(max_length=25, null=True, blank=True)
	chat = models.ManyToManyField(TMessage)

	def delete(self, *args, **kwargs):
		game1, game2, game3 = self.game1, self.game2, self.game3
		self.game1 = None
		self.game2 = None
		self.game3 = None
		self.save(update_fields=["game1", "game2", "game3"])

		if game1 and not Tournament.objects.filter(models.Q(game1=game1) | models.Q(game2=game1) | models.Q(game3=game1)).exists():
			game1.delete()
		if game2 and not Tournament.objects.filter(models.Q(game1=game2) | models.Q(game2=game2) | models.Q(game3=game2)).exists():
			game2.delete()
		if game3 and not Tournament.objects.filter(models.Q(game1=game3) | models.Q(game2=game3) | models.Q(game3=game3)).exists():
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

@receiver(post_save, sender=Tournament)
def create_Lobbies(sender, instance, created, **kwargs):
	if created:
		game1 = Lobby.objects.create(lobby_id=f"tournament_{instance.tournament_id}_1")
		game2 = Lobby.objects.create(lobby_id=f"tournament_{instance.tournament_id}_2")
		game3 = Lobby.objects.create(lobby_id=f"tournament_{instance.tournament_id}_3")
		instance.game1 = game1
		instance.game2 = game2
		instance.game3 = game3
		instance.save()