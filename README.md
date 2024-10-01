
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