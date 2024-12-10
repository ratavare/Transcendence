from rest_framework import serializers
from .models import Friendships
from django.contrib.auth.models import User

class FriendshipSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendships
        fields = ['from_user', 'to_user', 'status', 'created']  # List all fields you want to include

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']
