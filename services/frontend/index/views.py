import requests, os
from django.http import JsonResponse

from django.shortcuts import render

from django.contrib.auth.models import User
from django.contrib.auth import login

from .forms import RegistrationForm
from django.contrib.auth.forms import AuthenticationForm

# JWT
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny

from pathlib import Path
from dotenv import load_dotenv
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '../.env'))

import logging
logging.basicConfig(level=logging.DEBUG)

def indexView(request):
		return render(request, 'index.html', {
			'registerForm': RegistrationForm,
			'loginForm': AuthenticationForm,
			"MAIN_HOST": os.getenv("MAIN_HOST"),
		})

def custom_404(request, exception):
    return render(request, '404.html', status=404)