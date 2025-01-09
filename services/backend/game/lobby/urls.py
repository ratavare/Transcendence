from django.urls import path
from . import views

app_name = "lobby"
urlpatterns = [
	path('lobbies/', views.lobbyView),
	path('lobbies/<str:lobby_id>/', views.lobbyView),
	path('lobbies/<str:lobby_id>/$<str:player>/', views.checkPlayer),
	path('lobbies/<str:lobby_id>/setReadyState/', views.setReadyState),
]
