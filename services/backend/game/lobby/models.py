from django.db import models

class Lobby(models.Model):
	lobby_id = models.CharField(max_length=25, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
	users = models.JSONField(default=list)

	def __str__(self):
		return f"{self.lobby_id} lobby created"
