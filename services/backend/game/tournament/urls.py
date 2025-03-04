from django.urls import path
from . import views

app_name = "tournament"
urlpatterns = [
	path('', views.createTournament),
	path('tournaments/', views.getTournaments),
	path('joinTournamentLobby/', views.joinTournamentLobby),
	path('getJoin/<str:tournament_id>/', views.getJoinTournament),
	# path('getReadyState/<str:tournament_id>/', views.getReadyState),
	path('getTournamentLobby/<str:tournament_id>/<str:lobby_id>/', views.getTournamentLobby),
	# path('checkTournamentPlayer/<str:tournament_id>/<str:username>/', views.checkTournamentPlayer),
]