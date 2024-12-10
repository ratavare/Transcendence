#!/bin/bash

sleep 8

BOLD_BLUE="\e[1;34m"
NC="\e[0m"

#Exits if any command exits with an error (!= 0)
set -e

echo "${BOLD_BLUE}Creating migrations...${NC}"
python manage.py makemigrations

echo "${BOLD_BLUE}Migrating...${NC}"
python manage.py migrate

echo "${BOLD_BLUE}Checking if superuser exists...${NC}"
if ! python manage.py shell -c "from django.contrib.auth.models import User; print(User.objects.filter(is_superuser=True).exists())" | grep -q 'True'; then
    echo "${BOLD_BLUE}Creating superuser...${NC}"
    DJANGO_SUPERUSER_USERNAME=root \
    DJANGO_SUPERUSER_EMAIL=root@example.com \
    DJANGO_SUPERUSER_PASSWORD=123 \
    python manage.py createsuperuser --noinput
else
    echo "${BOLD_BLUE}Superuser already exists, skipping creation...${NC}"
fi

echo "${BOLD_BLUE}Starting the server...${NC}"
python manage.py runserver 0.0.0.0:8001
