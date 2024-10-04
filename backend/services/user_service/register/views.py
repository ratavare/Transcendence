from django.shortcuts import render, redirect
from django.views import generic
from django.contrib.auth.models import User

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from rest_framework.views import APIView

from .forms import RegistrationForm
from .serializers import UserRegisterSerializer

@api_view(['POST', 'GET'])
@permission_classes((permissions.AllowAny,))
def apiRegisterView(request):
	if request.method == "POST":
		form = RegistrationForm(request.POST)
		if form.is_valid():
			serializer = UserRegisterSerializer(data={
				'username': form.cleaned_data['username'],
				'email': form.cleaned_data['email'],
				'password': form.cleaned_data['password1']})
			if serializer.is_valid():
				serializer.save()
				return Response(serializer.data, status=201)
			return Response(serializer.errors, status=400)
	elif request.method == "GET":
		users = User.objects.all()
		serializer = UserRegisterSerializer(users, many=True)
		return Response(serializer.data)

def registerView(request):
	if request.method == "POST":
		form = RegistrationForm(request.POST)
		if form.is_valid():
			form.save()
			return redirect('register:user')
	else:
		form = RegistrationForm()
		
	return render(request, 'register/register.html', {"form":form})

class UsersView(generic.ListView):
	template_name = "register/user.html"
	context_object_name = "user_list"

	def get_queryset(self):
		return User.objects.all()