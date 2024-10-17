
## Django, PostgreSQL, Bootstrap simple setup

### Setup

* Docker build
```sh
make build
```

* Access user container
```sh
docker exec -it [container] bash
```

* Django admin creation
```sh
python manage.py createsuperuser
```

* Access web page
```sh
localhost:8004
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
docker exec -it [container] bash
python manage.py migrate
```

after doing `make re`