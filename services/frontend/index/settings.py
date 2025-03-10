
from pathlib import Path
import os
from dotenv import load_dotenv

# Build paths inside the mysite like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(os.path.join(BASE_DIR, '../.env'))

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-3ez88!$-2nk6$u2y@=2_*@88vwaky2xsx3@$m5ej%-f#rfwn*a'
MAIN_HOST = os.getenv("MAIN_HOST")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["localhost", MAIN_HOST]

CSRF_TRUSTED_ORIGINS = [f"https://localhost:8443", f"https://{MAIN_HOST}:8443"]

INSTALLED_APPS = [
	'index.apps.IndexConfig',
	'django.contrib.admin',
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.messages',
	'django.contrib.staticfiles',
	'crispy_forms',
	'crispy_bootstrap5',
]

CHANNEL_LAYERS = {
	'default': {
		'BACKEND': 'channels.layers.InMemoryChannelLayer',
	}
}

MIDDLEWARE = [
	'django.middleware.security.SecurityMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.middleware.csrf.CsrfViewMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.messages.middleware.MessageMiddleware',
	'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'index.urls'

TEMPLATES = [
	{
		'BACKEND': 'django.template.backends.django.DjangoTemplates',
		'DIRS': [],
		'APP_DIRS': True,
		'OPTIONS': {
			'context_processors': [
				'django.template.context_processors.debug',
				'django.template.context_processors.request',
				'django.contrib.auth.context_processors.auth',
				'django.contrib.messages.context_processors.messages',
			],
		},
	},
]

WSGI_APPLICATION = 'index.wsgi.application'

# Database
DATABASES = {
	'default': {
		'ENGINE': 'django.db.backends.postgresql',
		'NAME': 'postgres',
		'USER': 'postgres_user',
		'PASSWORD': 'postgres_password',
		'HOST': 'database',
		'PORT': '5432',
	}
}


# Password validation
AUTH_PASSWORD_VALIDATORS = [
	{
		'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
	},
	{
		'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
	},
]


# Internationalization
LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True

DATE_INPUT_FORMAT = [
	'%Y-%m-%d',
	'%Y/%m/%d',
	'%y/%m/%d'
]

USE_L10N = False

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'

CRISPY_TEMPLATE_PACK = 'bootstrap5'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'