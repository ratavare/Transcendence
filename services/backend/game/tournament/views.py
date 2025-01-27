import json
from django.http import JsonResponse
from .models import Tournament, TournamentPlayer
from .serializers import TournamentSerializer
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
			id = request.data.get('tournament_id')
			validator(id)
			tournament = Tournament.objects.create(tournament_id=id)
			return JsonResponse({'tournament_id': id}, status=200)
		except ValidationError:
				return JsonResponse({'error': 'Regex'}, status=400)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def getJoinTournament(request, tournament_id):
	if request.method == 'POST':
		return joinTournament(request, tournament_id)
	if request.method == 'GET':
		return getTournament(request, tournament_id)

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
	except Tournament.DoesNotExist:
		return JsonResponse({'error': 'Tournament does not exist'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'error': 'User does not exist'}, status=400)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)

def getTournament(request, tournament_id):
	try:
		tournament = Tournament.objects.get(tournament_id=tournament_id)
		serializer = TournamentSerializer(tournament)
		return JsonResponse({'tournament': serializer.data}, status=200)
	except Tournament.DoesNotExist:
		return JsonResponse({'error': 'Tourament does not exist'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getTournaments(request):
	if request.method == "GET":
		tournaments = Tournament.objects.all()
		if not tournaments:
			return JsonResponse({'error': 'No lobbies found'}, status=404)
		all_tournaments = [{'tournament_id': tournament.tournament_id} for tournament in tournaments]
		return JsonResponse({'tournaments': all_tournaments}, status=200)
