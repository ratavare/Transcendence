from django.http import JsonResponse
from django.contrib.auth.models import User
from django.db import models
from .models import Friendships
from .serializers import FriendshipSerializer, UserSerializer
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

def getFriends(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)

			username = data.get('user')
			user = User.objects.get(username=username)

			friendships = Friendships.objects.filter(
			models.Q(from_user=user, status='accepted') |
			models.Q(to_user=user, status='accepted'))

			friends = []
			for friendship in friendships:
				if friendship.to_user == user:
					friends.append(friendship.from_user)
				else:
					friends.append(friendship.to_user)
			serializer = UserSerializer(friends, many=True)
			return JsonResponse({'friends': serializer.data}, status=200)
		
		except User.DoesNotExist:
			return JsonResponse({'error': 'User not found'}, status=404)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	
def acceptFriendRequest(request):
	pass