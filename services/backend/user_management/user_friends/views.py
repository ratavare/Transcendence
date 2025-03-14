from django.http import JsonResponse
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from rest_framework.permissions import IsAuthenticated
from django.db import models
from django.db.models import Q

# JWT
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from .models import Friendships
from .serializers import FriendshipSerializer, UserSerializer
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def friendSearchView(request):
	userSearched = request.POST.get('username')
	
	if not userSearched:
		return JsonResponse({'error': 'No users found!'}, status=404)

	all_users = User.objects.filter(username__icontains=userSearched)
	exceptions = Friendships.objects.filter(from_user=request.user).values_list('to_user', flat=True)

	users = []
	for user in all_users:
		if user.username == 'root' or user == request.user or user.id in exceptions:
			continue
		users.append({'username': user.username})
	if not users:
		return JsonResponse({'error': 'No users found'}, status=404)
	return JsonResponse({'users': users}, status=200)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def sendFriendRequest(request):
	try:
		data = json.loads(request.body)

		source = data.get('src')
		destination = data.get('dest')
		source_user = User.objects.get(username=source)
		destination_user = User.objects.get(username=destination)

		existing_request = Friendships.objects.filter(
			Q(from_user=source_user, to_user=destination_user) |
			Q(from_user=destination_user, to_user=source_user)
		).first()

		if existing_request:
			if existing_request.status == 'requested' and existing_request.from_user == destination_user:
				existing_request.status = 'accepted'
				Friendships.objects.create(
					from_user=source_user,
					to_user=destination_user,
					status='accepted'
				)
				existing_request.save()
				return JsonResponse({'success': 'Friendship accepted due to reverse request.'}, status=200)
			return JsonResponse({'message': "Friendship already exists or is pending."}, status=400)

		new_request = Friendships.objects.create(from_user=source_user, to_user=destination_user, status='requested')
		serializer = FriendshipSerializer(new_request)
		return JsonResponse({'newRequest': serializer.data}, status=200)

	except User.DoesNotExist:
		return JsonResponse({'error': 'User(s) not found'}, status=404)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def handleFriendRequest(request):
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
	except User.DoesNotExist:
		return JsonResponse({'error': 'User not found.'}, status=404)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)
		
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteFriend(request):
	try:
		data = json.loads(request.body)
		src = data.get('src')
		dest = data.get('dest')
		src_user = User.objects.get(username=src)
		dest_user = User.objects.get(username=dest)

		friend1 = Friendships.objects.filter(from_user=src_user, to_user=dest_user, status='accepted')
		friend2 = Friendships.objects.filter(from_user=dest_user, to_user=src_user, status='accepted')

		if not friend1 and not friend2:
			return JsonResponse({'error': 'User not found.'}, status=404)
		friend1.delete()
		friend2.delete()

		return JsonResponse({'success':'Friendship deleted'}, status=200)
	except User.DoesNotExist:
		return JsonResponse({'error': 'User not found.'}, status=404)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deleteFriendRequest(request):
	try:
		data = json.loads(request.body)
		src = data.get('src')
		dest = data.get('dest')
		src_user = User.objects.get(username=src)
		dest_user = User.objects.get(username=dest)
		Friendships.objects.filter(from_user=dest_user, to_user=src_user, status='requested').delete()

		return JsonResponse({'success':'Friendship Request deleted'}, status=200)
	except User.DoesNotExist:
		return JsonResponse({'error': 'User not found.'}, status=404)
	except Exception as e:
		return JsonResponse({'error': str(e)}, status=400)


class UnifiedFriendshipAPI(APIView):
	permission_classes = [IsAuthenticated]
	renderer_classes = [JSONRenderer]

	def get(self, request):
		user = request.user

		# Get Friends
		friendships = Friendships.objects.filter(from_user=user, status='accepted')
		friends = [friendship.to_user for friendship in friendships]

		# Get Friend Requests
		friend_requests = Friendships.objects.filter(to_user=user, status='requested')
		friends_requests_list = [friend_request.from_user for friend_request in friend_requests]

		# Get Sent Friend Requests
		sent_requests = Friendships.objects.filter(from_user=user, status='requested')
		sent_requests_list = [sent_request.to_user for sent_request in sent_requests]

		# Serialize the data
		friends_serializer = UserSerializer(friends, many=True)
		friend_requests_serializer = UserSerializer(friends_requests_list, many=True)
		sent_requests_serializer = UserSerializer(sent_requests_list, many=True)

		# Consolidated Response
		data = {
			"friends": friends_serializer.data,
			"friendRequests": friend_requests_serializer.data,
			"sentFriendRequests": sent_requests_serializer.data,
		}

		return Response(data, status=200)
