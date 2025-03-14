import json, re
from django.http import JsonResponse
from .models import Tournament, TournamentPlayer
from lobby.models import Lobby
from .serializers import TournamentSerializer
from lobby.serializers import LobbySerializer
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from django.core.validators import RegexValidator
from django.utils.timezone import now
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def createTournament(request):
	if request.method == "POST":
		validator = RegexValidator('[+/%!?,.$%#&*~-]', inverse_match=True)
		try:
			tournament_id = request.data.get('tournament_id')
			tournament_id = re.sub(r"\s+", "", tournament_id)
			validator(tournament_id)
			tournament = Tournament(tournament_id=tournament_id)
			tournament.save()
			return JsonResponse({'tournament_id': tournament_id}, status=200)
		except ValidationError:
			return JsonResponse({'error': 'Regex'}, status=400)
		except IntegrityError:
			return JsonResponse({'error': "Tournament already exists"}, status=400)
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
		if selectedTournament.players.filter(username=username).exists():
			return JsonResponse({'status': 'User already exists'}, status=200)
		TournamentPlayer.objects.create(tournament=selectedTournament, player=user, joined_at=now())
		selectedTournament.save()
		return JsonResponse({'status': 'success'}, status=200)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTournaments(request):
	tournaments = Tournament.objects.all()
	if not tournaments:
		return JsonResponse({'error': 'No lobbies found'}, status=404)
	all_tournaments = [{'tournament_id': tournament.tournament_id} for tournament in tournaments]
	return JsonResponse({'tournaments': all_tournaments}, status=200)
	
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def joinTournamentLobby(request):
	try:
		data = json.loads(request.body)
		username = data.get('username')
		lobby_id = data.get('lobby_id')
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
	
def getTournamentLobby(request, tournament_id, lobby_id):
	try:
		tournament = Tournament.objects.get(tournament_id=tournament_id)
		lobby = Lobby.objects.get(lobby_id=lobby_id)
		if tournament.game1 == lobby or tournament.game2 == lobby or tournament.game3 == lobby:
			return JsonResponse({'status': f'{lobby_id} is from {tournament_id}'}, status=200)
		return JsonResponse({'error': f'Tournament {tournament_id} has no game {lobby_id}'}, status=404)
	except Tournament.DoesNotExist:
		return JsonResponse({'error': 'Tournament does not exist'}, status=400)
	except Lobby.DoesNotExist:
		return JsonResponse({'error': 'Lobby does not exist'}, status=400)
	except Exception as e:
		return JsonResponse({'error': f'Unexpected error {str(e)}'}, status=400)