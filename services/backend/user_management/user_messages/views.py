from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.db import models
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from .serializers import ConversationSerializer, MessageSerializer
from .models import Conversation

@api_view(['GET'])
def getConversations(request):
	if not request.user.is_authenticated:
		return Response({'error': 'Authentication required'}, status=401)

	try:
		user = request.user

		conversations = user.conversations.all()
		
		# Passing context to the serializer will provide the user
		# and have it removed from the serialized data.
		serializer = ConversationSerializer(conversations, many=True, context={'request': request})

		data = serializer.data
		return Response(data, status=200)

	except Exception as e:
		return JsonResponse({'error': str(e)}, status=405)
	
@api_view(['GET'])
def getMessages(request, conversation_id):
	if not request.user.is_authenticated:
		return Response({'error': 'Authentication required'}, status=401)
	
	try:
		conversation = Conversation.objects.get(id=conversation_id)
		messages = conversation.messages.order_by("timestamp")
		
		serializer = MessageSerializer(messages, many=True)

		return Response(serializer.data)

	except Conversation.DoesNotExist:
		return Response({"error": "Conversation not found or access denied."}, status=404)

@api_view(['POST'])
def startConversation(request, friend):
	try:
		user = request.user
		friend = User.objects.get(username=friend)

		existing_conversation = Conversation.objects.filter(participants=user).filter(participants=friend).first()
		if existing_conversation:
			serializer = ConversationSerializer(existing_conversation)
			return Response(serializer.data, status=200)

		conversation = Conversation.objects.create()
		conversation.participants.set([user, friend])
		serializer = ConversationSerializer(conversation, context={'request': request})

		return Response(serializer.data, status=201)
	except User.DoesNotExist:
		return Response({"error": "Not a valid friend or user doesn't exist."}, status=404)