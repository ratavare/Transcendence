from django.contrib import admin
from .models import ProxyLobby

@admin.register(ProxyLobby)
class ProxyLobbyAdmin(admin.ModelAdmin):
	list_display = ('lobby_id', 'created_at', 'user_list', 'gameState', 'player1Score', 'player2Score', 'player1Ready', 'player2Ready')

	def user_list(self, obj):
		users = obj.get_users()
		return ", ".join(users) if users else "No users"
	user_list.short_description = "Users"
