from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from rest_framework.views import APIView
from lobby.models import Lobby

class createOrGetLobby(APIView):

	@csrf_exempt
	def post(self, request):
		try:
			id = request.POST.get('lobby_id')
			newLobby = Lobby.objects.create(lobby_id=id)	
			newLobby.save()
		except:
			return JsonResponse({'error': 'lobby already exists'}, status=200)
		return JsonResponse({'lobby_id': id}, status=200)
	
	@csrf_exempt
	def get(self, request):
		lobbies = Lobby.objects.all()
		if not lobbies:
			return JsonResponse({'Error': 'No lobbies found'}, status=404)
		all_lobbies = []
		for lobby in lobbies:
			all_lobbies.append({'lobby_id': lobby.lobby_id})
		return JsonResponse({'lobbies': all_lobbies}, status=200)

class joinLobby(APIView):

	@csrf_exempt
	def post(self, request, lobby_id):
		selectedLobby = Lobby.objects.filter(lobby_id)
		if not selectedLobby:
			return JsonResponse({'error': 'Lobby does not exist'}, status=400)
		return JsonResponse({'status': 'success'}, status=200)