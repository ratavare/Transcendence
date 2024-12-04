from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from lobby.models import Lobby
from lobby.serializers import LobbySerializer

class lobbyView(APIView):

	@csrf_exempt
	def post(self, request, lobby_id=None):
		if lobby_id:
			return self.join(request, lobby_id)
		return self.create(request)
	
	@csrf_exempt
	def get(self, request):
		lobbies = Lobby.objects.all()
		if not lobbies:
			return JsonResponse({'Error': 'No lobbies found'}, status=404)
		all_lobbies = []
		for lobby in lobbies:
			all_lobbies.append({'lobby_id': lobby.lobby_id})
		return JsonResponse({'lobbies': all_lobbies}, status=200)
	
	def create(self, request):
		try:
			id = request.POST.get('lobby_id')
			newLobby = Lobby.objects.create(lobby_id=id)
			newLobby.save()
			return JsonResponse({'lobby_id': id}, status=200)
		except:
			return JsonResponse({'error': 'lobby already exists'}, status=200)

	def join(self, request, lobby_id):
		try:
			username = request.data.get('username')
			user = User.objects.get(username=username)
			selectedLobby = Lobby.objects.get(lobby_id=lobby_id)
			selectedLobby.users.add(user)
			serilizer = LobbySerializer(selectedLobby)
			return JsonResponse({'data': serilizer.data}, status=200)
		except Lobby.DoesNotExist:
			return JsonResponse({'error': 'Lobby does not exist'}, status=400)
		except User.DoesNotExist:
			return JsonResponse({'error': 'User does not exist'}, status=400)