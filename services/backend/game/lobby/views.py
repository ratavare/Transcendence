import json
from django.db import IntegrityError
from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from lobby.models import Lobby
from lobby.serializers import LobbySerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getLobby(request, lobby_id=None):
	if lobby_id:
		lobby = Lobby.objects.get(lobby_id=lobby_id)
		serializer = LobbySerializer(lobby)
		return JsonResponse({'lobby': serializer.data}, status=200)

	lobbies = Lobby.objects.all()
	if not lobbies:
		return JsonResponse({'error': 'No lobbies found'}, status=404)
	all_lobbies = []
	for lobby in lobbies:
		all_lobbies.append({'lobby_id': lobby.lobby_id})
	return JsonResponse({'lobbies': all_lobbies}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def postLobby(request, lobby_id=None):
	if lobby_id:
		return joinLobby(lobby_id)
	return createLobby(lobby_id)

def joinLobby(request, lobby_id):
	try:
		data = json.loads(request.body)
		username = data.get('username')
		user = User.objects.get(username=username)
		selectedLobby = Lobby.objects.get(lobby_id=lobby_id)
		selectedLobby.save()
		selectedLobby.users.add(user)
		serilizer = LobbySerializer(selectedLobby)
		return JsonResponse({'data': serilizer.data}, status=200)
	except Lobby.DoesNotExist:
		return JsonResponse({'error': 'Lobby does not exist'}, status=400)
	except User.DoesNotExist:
		return JsonResponse({'error': 'User does not exist'}, status=400)
	
def createLobby(request):
	try:
		id = request.POST.get('lobby_id')
		Lobby.objects.create(lobby_id=id)
	except IntegrityError:
		return JsonResponse({'error': 'lobby already exists'}, status=400)
	return JsonResponse({'lobby_id': id}, status=200)

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getChat(request, lobby_id):
	pass