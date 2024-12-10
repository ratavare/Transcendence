import logging
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from .forms import UpdateProfileForm
from .models import Profile

# JWT
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

logging.basicConfig(level=logging.DEBUG)

import logging
logging.basicConfig(level=logging.DEBUG)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def profileView(request):
	logging.debug("initial_data")
	try:
		user=request.user
		profile = Profile.objects.get(user=user)
		logging.debug("initial_data")
	except Profile.DoesNotExist:
		logging.debug("initial_data")
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
			return JsonResponse({'error': str(e)}, status=409)
		return JsonResponse({'status': 'success'}, status=200)
	elif request.method == 'GET':
		initial_data = {
			'username': user.username,
			'email': user.email,
			'bio': profile.bio,
			'birth_date':profile.birth_date,
			'id': user.pk,
		}
		logging.debug("initial_data")
		return JsonResponse(initial_data, status=200)
	return JsonResponse({'error': "Test"}, status=400)