from django.contrib.auth import logout
from django.http import JsonResponse

def logoutView(request):
	if request.method == 'POST':
		logout(request)
		return JsonResponse({'status': 'success'})
	return JsonResponse({'status': 'error', 'message': 'Invalid Request'}, status=400)