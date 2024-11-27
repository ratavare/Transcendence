from django.urls import path
from .views import createOrGetLobby, joinLobby

app_name = "lobby"
urlpatterns = [
	path('lobbies/', createOrGetLobby.as_view()),
	path('lobbies/<str:lobby_id>/', joinLobby.as_view()),
]