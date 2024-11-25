from django.urls import path
from . import views

app_name = "lobby"
urlpatterns = [
	path('create-lobby/', views.createLobbyView),
	path('<str:lobby_id>/', views.joinLobbyView),
]