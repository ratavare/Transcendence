from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

app_name = "user_auth"
urlpatterns = [
	path('enable_2fa/', views.enable_2fa),
	path('disable_2fa/', views.disable_2fa),
	path('verify_otp/', views.verify_otp),
	path('register/', views.registerView),
	path('login/', views.loginView),
	path('logout/', views.logoutView),
	path('user_search/', views.userSearchView),
	path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
