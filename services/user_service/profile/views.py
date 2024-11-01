import logging
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import logout
from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from .forms import UpdateProfileForm
from .models import Profile

logging.basicConfig(level=logging.DEBUG)

# @POST
@login_required
def profileView(request):
	if request.method == 'POST':
		user = request.user
		profile = get_object_or_404(Profile, user=user)
		profileForm = UpdateProfileForm(request.POST, instance=profile)
		username = request.POST.get('username')
		email = request.POST.get('email')

		user.username = username;
		user.email = email;

		try:
			user.save()
			if profileForm.is_valid():
				profileForm.save()
			else:
				raise ValidationError(profileForm.errors)
		except Exception as e:
			return JsonResponse({'status': 'error', 'errors': str(e)}, status=409)
		return JsonResponse({'status': 'success'}, status=200)

def account_delete(request):
	if request.method == 'POST':
		user = request.user
		logout(request)
		user.delete()
		return JsonResponse({'status': 'success'}, status=200)

@login_required
def friends(request):
	return JsonResponse({'status': 'success'}, status=200)

@login_required
def searchfriends(request):
	return JsonResponse({'status': 'success'}, status=200)