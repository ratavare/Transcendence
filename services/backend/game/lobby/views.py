from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework import viewsets
from .models import Lobby
from lobby.models import Lobby
from lobby.serializers import LobbySerializer

# JWT
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

class createOrGetLobby(APIView):

	@permission_classes([IsAuthenticated])
	def post(self, request, lobby_id=None):
		if lobby_id:
			try:
				username = request.data.get('username')
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


		try:
			id = request.POST.get('lobby_id')
			newLobby = Lobby.objects.create(lobby_id=id)	
			newLobby.save()
		except:
			return JsonResponse({'error': 'lobby already exists'}, status=200)
		return JsonResponse({'lobby_id': id}, status=200)
	
	@permission_classes([IsAuthenticated])
	def get(self, request):
		lobbies = Lobby.objects.all()
		if not lobbies:
			return JsonResponse({'Error': 'No lobbies found'}, status=404)
		all_lobbies = []
		for lobby in lobbies:
			all_lobbies.append({'lobby_id': lobby.lobby_id})
		return JsonResponse({'lobbies': all_lobbies}, status=200)
