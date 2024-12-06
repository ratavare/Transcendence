from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.db import models
from .models import Friendships
from .serializers import FriendshipSerializer, UserSerializer
import json

def userSearchView(request):
	if request.method == 'POST':
		userSearched = request.POST.get('username')
		
		if not userSearched:
			return JsonResponse({'error': 'No users found!'}, status=404)
		# gets all users that contain 'userSearched'; Not sensitive to case
		all_users = User.objects.filter(username__icontains=userSearched)
		
		users = []
		for user in all_users:
			if user.username == 'root' or user == request.user:
				continue
			users.append({'username': user.username})
		if not users:
			return JsonResponse({'error': 'No users found!'}, status=404)
		return JsonResponse({'users': users}, status=200)
	return JsonResponse({"error": "Wrong Method"}, status=400)

@login_required
def sendFriendRequest(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)

			source = data.get('src')
			destination = data.get('dest')

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

@login_required
def getFriends(request):
	if request.method == 'GET':
		try:
			user = request.user.id
			friendships = Friendships.objects.filter(models.Q(from_user=user, status='accepted'))
			friends = []
			for friendship in friendships:
				friends.append(friendship.to_user)
			serializer = UserSerializer(friends, many=True)
			return JsonResponse({'friends': serializer.data}, status=200)
		except User.DoesNotExist:
			return JsonResponse({'error': 'User not found'}, status=404)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)

@login_required
def friendRequest(request):
	if request.method == 'GET':
		try:
			user = request.user.id
			friendRequests = Friendships.objects.filter(
			models.Q(to_user=user, status='requested'))

			friendsRequestsList = []
			for request in friendRequests:
				friendsRequestsList.append(request.from_user)
			serializer = UserSerializer(friendsRequestsList, many=True)
			return JsonResponse({'friendRequests': serializer.data}, status=200)

		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	
def handleFriendRequest(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			source = data.get('src')
			destination = data.get('dest')
			intention = data.get('intention')
			source_user = User.objects.get(username=source)
			destination_user = User.objects.get(username=destination)
			friend_request = Friendships.objects.get(from_user=source_user, to_user=destination_user)
			if not friend_request:
				return JsonResponse({'error':'Friend request does not exist'}, status=404)
			if intention == 'decline':
				friend_request.delete()
			elif intention == 'accept':
				friend_request.status = 'accepted'
				friend_request.save()
				reverse_friend_request = Friendships(from_user=destination_user, to_user=source_user, status='accepted')
				reverse_friend_request.save()

			return JsonResponse({'success': f"Friendship request {intention}ed successfully"}, status=200)

		except Exception as e:
			return JsonResponse({'error': str(e)}, status=400)
		
def deleteFriend(request):
	if request.method == 'POST':
		try:
			data = json.loads(request.body)
			src = data.get('src')
			dest = data.get('dest')
			src_user = User.objects.get(username=src)
			dest_user = User.objects.get(username=dest)

			Friendships.objects.filter(from_user=src_user, to_user=dest_user).delete()
			Friendships.objects.filter(from_user=dest_user, to_user=src_user).delete()
	
			return JsonResponse({'success':'Friendship deleted'}, status=200)
		except User.DoesNotExist:
			return JsonResponse({'error': 'User not found.'}, status=404)
		except Exception as e:
			return JsonResponse({'error': str(e)}, status=500)
	return JsonResponse({'error': 'Invalid request method.'}, status=400)

