from django.http import JsonResponse
from django.db import models
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User

import logging
logging.basicConfig(level=logging.DEBUG)

@login_required
def getConversations(request):
	try:
		user = request.user
	except User.DoesNotExist:
		return JsonResponse({'error': 'User not found.'}, status=404)
	conversations = user.conversations.all()
	# logging.debug("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
	return JsonResponse({'convos': conversations}, status=200)
		
