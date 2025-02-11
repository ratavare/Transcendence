from django.urls import path
from . import views

app_name = "tournament"
urlpatterns = [
	path('', views.createTournament),
	path('$<str:tournament_id>/', views.getJoinTournament),
	path('tournaments/', views.getTournaments),
	path('joinTournamentLobby/<str:lobby_id>/', views.joinTournamentLobby),
]