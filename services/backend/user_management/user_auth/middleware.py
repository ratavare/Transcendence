from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from rest_framework.authentication import get_authorization_header
from django.utils.deprecation import MiddlewareMixin
from rest_framework.response import Response
from rest_framework import status

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        auth_header = get_authorization_header(request).split()
        if len(auth_header) == 2 and auth_header[0].lower() == b'bearer':
            token = auth_header[1].decode()
            try:
                # Validate the access token
                AccessToken(token)
            except TokenError as e:
                if isinstance(e, InvalidToken):
                    return self.handle_invalid_token(request)
        return None

    def handle_invalid_token(self, request):
        refresh_token = request.headers.get('Refresh-Token')
        if refresh_token:
            try:
                # Attempt to refresh the token
                refresh = RefreshToken(refresh_token)
                access_token = refresh.access_token
                return Response(
                    {
                        "access": str(access_token)
                    },
                    status=status.HTTP_200_OK,
                )
            except TokenError:
                return Response(
                    {"error": "Invalid refresh token"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
        return Response({"error": "Token expired or invalid"}, status=status.HTTP_401_UNAUTHORIZED)