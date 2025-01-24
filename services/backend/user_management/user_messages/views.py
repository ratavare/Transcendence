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
		serializer = ConversationSerializer(conversations, many=True)

		data = serializer.data
		for conversation in data:
			filtered_paricipants = []
			for participant in conversation['participants']:
				if participant['id'] != user.id:
					filtered_paricipants.append(participant)
			conversation['participants'] = filtered_paricipants

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