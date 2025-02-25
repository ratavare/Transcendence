import jwt
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken

import logging
logging.basicConfig(level=logging.DEBUG)

class JWTMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path.startswith('/admin/'):
            return  # Skip further processing for admin pages
        auth = request.headers.get('Authorization', None)
        logging.debug(f"Authorization Header: {auth}")
        if auth is not None:
            try:
                # Extract the token from the header
                token = auth.split()[1]
                # Decode and verify the token
                validated_token = JWTAuthentication().get_validated_token(token)
                # Attach the user to the request
                request.user = JWTAuthentication().get_user(validated_token)
                logging.debug(f"User authenticated: {request.user}")
            except (IndexError, InvalidToken, jwt.ExpiredSignatureError, jwt.DecodeError) as e:
                logging.debug(f"Token validation error: {e}")
                request.user = AnonymousUser()
        else:
            request.user = AnonymousUser()