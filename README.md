
## Django, PostgreSQL, Bootstrap simple setup

Simple web page that creates an user and displays all users created.

### Setup

* Docker build
```sh
make build
```

* Access backend container
```sh
docker exec -it backend/ bash
```

* Django admin creation
```sh
python manage.py createsuperuser
```

* Access web page
```sh
localhost:8000
```

### Tips

* Connection

To start remote server do (there may be another and more efficient way):

```sh
ngrok http [PORT]
```

Don't forget to change redirect uri in intra.42 API config page

Always remember to do:

```sh
docker exec -it transcendence-user_service-1 bash
python manage.py migrate
```

after doing `make re`