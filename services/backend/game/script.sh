#!/bin/bash

sleep 4

BOLD_ORANGE="\e[1;33m"
NC="\e[0m"

#Exits if any command exits with an error (!= 0)
set -e

echo "${BOLD_ORANGE}Creating migrations...${NC}"
python manage.py makemigrations

echo "${BOLD_ORANGE}Migrating...${NC}"
python manage.py migrate

echo "${BOLD_ORANGE}Starting the server...${NC}"
python -u manage.py runserver 0.0.0.0:8002
daphne -p 8002 game.asgi:application
