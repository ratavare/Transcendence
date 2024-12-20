from django.urls import path
from . import views

app_name = "lobby"
urlpatterns = [
	path('lobbies/', views.getLobby),
	path('$lobbies/', views.postLobby),
	path('lobbies/<str:lobby_id>/', views.getLobby),
	path('lobbies/$<str:lobby_id>/', views.postLobby),
	path('lobbies/<str:lobby_id>/$<str:player>/', views.checkPlayer),
	path('lobbies/<str:lobby_id>/setReadyState/', views.setReadyState),
]
