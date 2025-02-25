from rest_framework import serializers
from .models import Message, Conversation
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ['id', 'username']

class MessageSerializer(serializers.ModelSerializer):
	sender = UserSerializer()

	class Meta:
		model = Message
		fields = ['id', 'sender', 'content', 'timestamp', 'is_read']

class ConversationSerializer(serializers.ModelSerializer):
	participants = UserSerializer(many=True)
	messages = MessageSerializer(many=True)

	class Meta:
		model = Conversation
		fields = ['id', 'participants', 'messages', 'updated_at']
	
	def to_representation(self, instance):
		""" Customize the serialized representation.
			The user that made the request wont be
			shown in the serialized data """
		
		# Get the default serialized data
		data = super().to_representation(instance)

		# Get the current user from the context (provided in the view)
		request = self.context.get('request')
		if request and request.user.is_authenticated:
			user_id = request.user.id

			# Filter out the current user from participants
			data['participants'] = [
				participant for participant in data['participants'] 
				if participant['id'] != user_id
			]

		return data