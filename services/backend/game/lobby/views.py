import json
from django.db import IntegrityError
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from lobby.models import Lobby
from lobby.serializers import LobbySerializer

@csrf_exempt
def lobbyView(request, lobby_id=None):
	if request.method == 'POST':
		# Join Lobby
		if lobby_id:
			try:
				data = json.loads(request.body)
				username = data.get('username')
				user = User.objects.get(username=username)
				selectedLobby = Lobby.objects.get(lobby_id=lobby_id)
				selectedLobby.users.add(user)
				serilizer = LobbySerializer(selectedLobby)
				return JsonResponse({'data': serilizer.data}, status=200)
			except Lobby.DoesNotExist:
				return JsonResponse({'error': 'Lobby does not exist'}, status=400)
			except User.DoesNotExist:
				return JsonResponse({'error': 'User does not exist'}, status=400)
		# Create Lobby
		try:
			id = request.POST.get('lobby_id')
			newLobby = Lobby.objects.create(lobby_id=id)
		except IntegrityError:
			return JsonResponse({'error': 'lobby already exists'}, status=400)
		return JsonResponse({'lobby_id': id}, status=200)

	if request.method == 'GET':
		if lobby_id:
			lobby = Lobby.objects.get(lobby_id=lobby_id)
			serializer = LobbySerializer(lobby)
			return JsonResponse({'lobby': serializer.data}, status=200)
		else:
			lobbies = Lobby.objects.all()
			if not lobbies:
				return JsonResponse({'error': 'No lobbies found'}, status=404)
			all_lobbies = []
			for lobby in lobbies:
				all_lobbies.append({'lobby_id': lobby.lobby_id})
			return JsonResponse({'lobbies': all_lobbies}, status=200)
	return JsonResponse({'error': 'Wrong method'}, status=400)

# def create(request):
# 	try:
# 		id = request.POST.get('lobby_id')
# 		newLobby = Lobby.objects.create(lobby_id=id)
# 		newLobby.save()
# 		return JsonResponse({'lobby_id': id}, status=200)
# 	except:
# 		return JsonResponse({'error': 'lobby already exists'}, status=200)

# def join(request, lobby_id):
# 	try:
# 		username = request.data.get('username')
# 		user = User.objects.get(username=username)
# 		selectedLobby = Lobby.objects.get(lobby_id=lobby_id)
# 		selectedLobby.users.add(user)
# 		serilizer = LobbySerializer(selectedLobby)
# 		return JsonResponse({'data': serilizer.data}, status=200)
# 	except Lobby.DoesNotExist:
# 		return JsonResponse({'error': 'Lobby does not exist'}, status=400)
# 	except User.DoesNotExist:
# 		return JsonResponse({'error': 'User does not exist'}, status=400)

@csrf_exempt
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
