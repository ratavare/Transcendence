from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.contrib.auth.models import User
from .models import Lobby
from .serializers import LobbySerializer
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lobbies(request):
	if request.method == 'GET':
		return getLobbies(request)
	elif request.method == 'POST':
		return createLobby(request)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def lobby_detail(request, lobby_id):
	if request.method == 'GET':
		return getLobby(request, lobby_id)
	elif request.method == 'POST':
		return joinLobby(request, lobby_id)

def getLobbies(request):
	lobbies = Lobby.objects.all()
	if not lobbies:
		return JsonResponse({'error': 'No lobbies found'}, status=404)
	all_lobbies = [{'lobby_id': lobby.lobby_id} for lobby in lobbies]
	return JsonResponse({'lobbies': all_lobbies}, status=200)

def getLobby(request, lobby_id):
	try:
		lobby = Lobby.objects.get(lobby_id=lobby_id)
		serializer = LobbySerializer(lobby)
		return JsonResponse({'lobby': serializer.data}, status=200)
	except Lobby.DoesNotExist:
		return JsonResponse({'error': 'Lobby does not exist'}, status=404)

def createLobby(request):
	validator = RegexValidator('[+/%!?,.$%#&*]', inverse_match=True)
	try:
		id = request.data.get('lobby_id')
		validator(id)
		newLobby = Lobby.objects.create(lobby_id=id)
		newLobby.save()
		return JsonResponse({'lobby_id': id}, status=200)
	except IntegrityError:
		return JsonResponse({'error': 'Lobby already exists'}, status=400)
	except ValidationError:
		return JsonResponse({'error': 'Regex'}, status=400)
	except:
		return JsonResponse({'error': 'Other error'}, status=400)

def joinLobby(request, lobby_id):
	try:
		data = json.loads(request.body.decode('utf-8'))
		if isinstance(data, str):
			data = json.loads(data)
		username = data.get('username')
		user = User.objects.get(username=username)
		selectedLobby = Lobby.objects.get(lobby_id=lobby_id)
		selectedLobby.users.add(user)
		selectedLobby.save()
		serializer = LobbySerializer(selectedLobby)
		return JsonResponse({'data': serializer.data}, status=200)
	except Lobby.DoesNotExist:
		return JsonResponse({'error': 'Lobby does not exist'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'error': 'User does not exist'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def checkPlayer(request, lobby_id, player):
	lobby = Lobby.objects.get(lobby_id=lobby_id)
	if lobby.users.filter(username=player).exists():
		usersInLobby = list(lobby.users.all())
		if usersInLobby[0].username == player:
			return JsonResponse({'playerId': '1'}, status=200)
		elif len(usersInLobby) > 1 and usersInLobby[1].username == player:
			return JsonResponse({'playerId': '2'}, status=200)
		return JsonResponse({'playerId': '3'}, status=404)
	return JsonResponse({'error': 'User not in Lobby'}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def setReadyState(request, lobby_id):
	lobby = Lobby.objects.get(lobby_id=lobby_id)
	player = json.loads(request.body)
	print("PLAYER: ", player, flush=True)
	if player == "1":
		lobby.player1Ready = True
	if player == "2":
		lobby.player2Ready = True
	print(f"Player1Ready: {lobby.player1Ready}, Player2Ready: {lobby.player2Ready}", flush=True)
	lobby.save()
	if lobby.player1Ready and lobby.player2Ready:
		return JsonResponse({'playersReady': 'true'}, status=200)
	return JsonResponse({'playersReady': 'false'}, status=200)