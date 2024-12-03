from django.contrib import admin
from .models import ProxyLobby

class ProxyLobbyAdmin(admin.ModelAdmin):
	list_display = ('lobby_id', 'created_at', 'user_list')

	def user_list(self, obj):
		users = obj.get_users()  # Ensure this method exists in the ProxyLobby model
		return ", ".join(users) if users else "No users"
	user_list.short_description = "Users"

admin.site.register(ProxyLobby, ProxyLobbyAdmin)

