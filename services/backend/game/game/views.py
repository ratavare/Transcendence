
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework.decorators import api_view

@login_required
@api_view(['GET'])
def gameApiView():
	return JsonResponse()