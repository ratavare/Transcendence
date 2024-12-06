from django.urls import path, include
from .views import createOrGetLobby

app_name = "lobby"
urlpatterns = [
	path('lobbies/', createOrGetLobby.as_view()),
	path('lobbies/<str:lobby_id>/', createOrGetLobby.as_view()),
]
