from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import Friendships
from .serializers import FriendshipSerializer
import json

def sendFriendRequest(request):
	if request.method == 'POST':
		data = json.loads(request.body)

		source = data.get('src')
		destination = data.get('dest')

		try:
			source_user = User.objects.get(username=source)
			destination_user = User.objects.get(username=destination)

			existing_request = Friendships.objects.filter(from_user=source_user, to_user=destination_user).exists()
			if (existing_request):
				return JsonResponse({'message': "Friendship request already exists"}, status=400)
			newRequest = Friendships(from_user=source_user, to_user=destination_user)
			newRequest.save()
			serializer = FriendshipSerializer(newRequest)
			return JsonResponse({'newRequest': serializer.data}, status=200)
		except User.DoesNotExist:
			return JsonResponse({'error': 'User(s) not found'}, status=404)

def acceptFriendRequest(request):
	pass