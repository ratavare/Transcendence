from django.urls import path
from . import views

app_name = "lobby"
urlpatterns = [
	path('lobbies/', views.lobbies),
	path('lobbies/<str:lobby_id>/', views.lobby_detail),
	path('lobbies/<str:lobby_id>/<str:player>/', views.checkPlayer),
	path('lobbies/<str:lobby_id>/setReadyState/', views.setReadyState),
    path('cli_lobby/', views.cli_createLobby),
]