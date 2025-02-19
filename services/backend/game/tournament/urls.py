from django.urls import path
from . import views

app_name = "tournament"
urlpatterns = [
	path('', views.createTournament),
	path('getJoin/<str:tournament_id>/', views.getJoinTournament),
	path('tournaments/', views.getTournaments),
	path('joinTournamentLobby/', views.joinTournamentLobby),
	path('getTournamentLobby/<str:tournament_id>/<str:lobby_id>/', views.getTournamentLobby),
	# path('checkTournamentPlayer/<str:tournament_id>/<str:username>/', views.checkTournamentPlayer),
]