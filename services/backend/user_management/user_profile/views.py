import logging
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from .forms import UpdateProfileForm
from .models import Profile

logging.basicConfig(level=logging.DEBUG)

@login_required
@csrf_exempt
def profileView(request):
	try:
		user=request.user
		profile = Profile.objects.get(user=user)
  	
	except Profile.DoesNotExist:
		return JsonResponse({'error': 'Profile Not Found'})
	if request.method == 'POST':
		profileForm = UpdateProfileForm(request.POST, instance=profile)
		username = request.POST.get('username')
		email = request.POST.get('email')

		user.username = username
		user.email = email

		try:
			user.save()
			if profileForm.is_valid():
				profileForm.save()
			else:
				raise ValidationError(profileForm.errors)
		except Exception as e:
			return JsonResponse({'status': 'error', 'errors': str(e)}, status=409)
		return JsonResponse({'status': 'success'}, status=200)
	elif request.method == 'GET':
		initial_data = {
			'username': user.username,
			'email': user.email,
			'bio': profile.bio,
			'birth_date':profile.birth_date,
		}
		return JsonResponse(initial_data, status=200)
	return JsonResponse({'error': "Test"}, status=400)