from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from .models import Lobby

@csrf_exempt
def createLobbyView(request):
	if request.method == 'POST':
		try:
			lobby_id = request.POST.get('lobby_id')
			newLobby = Lobby.objects.create(lobby_id=lobby_id)
			newLobby.save()
		except:
			return JsonResponse({'error': 'Lobby ID invalid/not found'}, status=404)
		return JsonResponse({'lobby_id': lobby_id}, status=200)
	return JsonResponse({'error': 'wrong method'}, status=400)

@csrf_exempt
def joinLobbyView(request):
	return JsonResponse({'status': 'success'}, status=200)