FROM python:latest

WORKDIR /user_management

COPY . .

RUN pip install --upgrade pip

RUN pip install -r requirements.txt

EXPOSE 8001

ENTRYPOINT [ "sh", "tail -f", "/dev/null" ]
# ENTRYPOINT [ "python", "manage.py", "runserver", "0.0.0.0:8000"]



