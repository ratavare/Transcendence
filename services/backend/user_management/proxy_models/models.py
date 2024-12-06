import requests
from django.db import models, connections
from django.contrib.auth.models import User

GAME_API_URL = "http://game:8002/lobby/api/"

class ProxyLobby(models.Model):
	lobby_id = models.CharField(max_length=25, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)

	class Meta:
		managed = False
		db_table = 'lobby_lobby'
		verbose_name = "Lobby"
		verbose_name_plural = "Lobbies"

	def get_users(self):
		with connections['default'].cursor() as cursor:
			cursor.execute("""
				SELECT auth_user.username
				FROM lobby_lobby_users
				JOIN auth_user ON lobby_lobby_users.user_id = auth_user.id
				WHERE lobby_lobby_users.lobby_id = (SELECT id FROM lobby_lobby WHERE lobby_id = %s)
			""", [self.lobby_id])
			return [row[0] for row in cursor.fetchall()]
		
# SELECT auth_user.username FROM lobby_lobby_users JOIN auth_user ON lobby_lobby_users.user_id = auth_user.id WHERE lobby_lobby_users.lobby_id = (SELECT lobby_id FROM lobby_lobby WHERE lobby_id = 'aaa');
