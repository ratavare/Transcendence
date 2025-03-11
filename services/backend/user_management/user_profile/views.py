import logging
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from .forms import UpdateProfileForm
from django.contrib.auth.models import User
from .models import Profile
from django.http import HttpResponse
import logging

# JWT
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

logging.basicConfig(level=logging.DEBUG)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def profileView(request):
	try:
		user=request.user
		profile = Profile.objects.get(user=user)
	except Profile.DoesNotExist:
		return JsonResponse({'error': 'Profile Not Found'})
	if request.method == 'POST':
		profileForm = UpdateProfileForm(request.POST, instance=profile)
		user.email = request.POST.get('email')

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
			'full_name': profile.full_name,
			'bio': profile.bio,
			'city': profile.city,
			'birth_date':profile.birth_date,
			'id': user.pk,
			'intra_login': profile.intra_login,
			'wins': profile.wins,
			'losses': profile.losses,
		}
		return JsonResponse(initial_data, status=200)
	return JsonResponse({'error': "Test"}, status=400)

@api_view(['POST', 'GET'])
@permission_classes([IsAuthenticated])
def profilePicture(request, username):
	try:
		user = User.objects.get(username=username)
		profile = Profile.objects.get(user=user)
	except Profile.DoesNotExist:
		return JsonResponse({'error': 'Profile Not Found'}, status=404)

	if request.method == 'POST':
		if 'profile_picture' in request.FILES:
			image_file = request.FILES['profile_picture']
			profile.profile_picture = image_file.read()
			profile.save()
			return JsonResponse({'status': 'Profile picture uploaded successfully!'}, status=200)
		else:
			return JsonResponse({'error': 'No image provided'}, status=400)

	if request.method == 'GET':
			if profile.profile_picture:
				response = HttpResponse(profile.profile_picture, content_type='image/jpeg')
				# response['Content-Disposition'] = 'inline; filename="profile.jpg"'  # Optional, specifies the filename
				return response
			else:
				logging.info("No profile picture found.")
				return JsonResponse({'error': 'No profile picture found'}, status=202)

def foreignProfile(request, username):
	try:
		user = User.objects.get(username=username)
		profile = Profile.objects.get(user=user)
	except Profile.DoesNotExist:
		return JsonResponse({'error': 'Profile Not Found'})
	initial_data = {
		'username': user.username,
		'email': user.email,
		'full_name': profile.full_name,
		'bio': profile.bio,
		'city': profile.city,
		'birth_date':profile.birth_date,
		'id': user.pk,
	}
	return JsonResponse(initial_data, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def updateWinLoss(request, status):
	try:
		user = request.user
		profile = Profile.objects.get(user=user)
	except Profile.DoesNotExist:
		return JsonResponse({'error': 'Profile Not Found'}, status=404)

	if request.method == 'POST':
		status = request.POST.get('status')
		if(status == 'win'):
			profile.wins += 1
		elif(status == 'loss'):
			profile.losses += 1
		profile.save()
		return JsonResponse({'status': 'success'}, status=200)
	return JsonResponse({'error': 'Invalid Request'}, status=400)