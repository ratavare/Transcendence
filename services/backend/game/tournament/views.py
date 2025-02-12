import json
from django.http import JsonResponse
from .models import Tournament, TournamentPlayer
from lobby.models import Lobby
from .serializers import TournamentSerializer
from lobby.serializers import LobbySerializer
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createTournament(request):
	if request.method == "POST":
		validator = RegexValidator('[+/%!?,.$%#&*]', inverse_match=True)
		try:
			tournament_id = request.data.get('tournament_id')
			validator(tournament_id)
			tournament = Tournament.objects.create(tournament_id=tournament_id)
			game1 = Lobby.objects.create(lobby_id=f"tournament_{tournament_id}_1")
			game2 = Lobby.objects.create(lobby_id=f"tournament_{tournament_id}_2")
			game3 = Lobby.objects.create(lobby_id=f"tournament_{tournament_id}_3")
			tournament.game1 = game1
			tournament.game1 = game2
			tournament.game1 = game3
			tournament.save()
			return JsonResponse({'tournament_id': tournament_id}, status=200)
		except ValidationError:
				return JsonResponse({'error': 'Regex'}, status=400)
		except Exception as e:
			return JsonResponse({'error': f"Other error: {str(e)}"}, status=400)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def getJoinTournament(request, tournament_id):
	if request.method == 'POST':
		return joinTournament(request, tournament_id)
	if request.method == 'GET':
		try:
			tournament = Tournament.objects.get(tournament_id=tournament_id)
			tournamentSerializer = TournamentSerializer(tournament)
			return JsonResponse({'tournament': tournamentSerializer.data}, status=200)
		except Tournament.DoesNotExist:
			return JsonResponse({'error': 'Tournament does not exist'}, status=404)

def joinTournament(request, tournament_id):
	try:
		data = json.loads(request.body.decode('utf-8'))
		if isinstance(data, str):
			data = json.loads(data)
		username = data.get('username')
		user = User.objects.get(username=username)
		selectedTournament = Tournament.objects.get(tournament_id=tournament_id)
		TournamentPlayer.objects.create(tournament=selectedTournament, player=user, joined_at=now())
		selectedTournament.save()
		return JsonResponse({'status': 'success'}, status=200)
	# except Tournament.DoesNotExist:
	# 	return JsonResponse({'error': 'Tournament does not exist'}, status=400)
	# except User.DoesNotExist:
	# 	return JsonResponse({'error': 'User does not exist'}, status=400)
	except Exception as e:
		return JsonResponse({'error': f"AAAAAAAAAA:{str(e)}"}, status=400)

# def getTournament(request, tournament_id):
# 	try:
# 		tournament = Tournament.objects.get(tournament_id=tournament_id)
# 		tournamentSerializer = TournamentSerializer(tournament)
# 		return JsonResponse({'tournament': tournamentSerializer.data}, status=200)
# 	except Tournament.DoesNotExist:
# 		return JsonResponse({'error': 'Tournament does not exist'}, status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTournaments(request):
	if request.method == "GET":
		tournaments = Tournament.objects.all()
		if not tournaments:
			return JsonResponse({'error': 'No lobbies found'}, status=404)
		all_tournaments = [{'tournament_id': tournament.tournament_id} for tournament in tournaments]
		return JsonResponse({'tournaments': all_tournaments}, status=200)
	
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def joinTournamentLobby(request, lobby_id):
	try:
		data = json.loads(request.body.decode('utf-8'))
		if isinstance(data, str):
			data = json.loads(data)
		username = data.get('username')
		user = User.objects.get(username=username)

		selectedLobby = Lobby.objects.get(lobby_id=lobby_id)
		selectedLobby.users.add(user)
		selectedLobby.save()
		lobbySerializer = LobbySerializer(selectedLobby)
		return JsonResponse({'data': lobbySerializer.data}, status=200)
	except Lobby.DoesNotExist:
		return JsonResponse({'error': 'Lobby does not exist'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'error': 'User does not exist'}, status=400)