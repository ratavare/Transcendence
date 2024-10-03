FROM python:latest

WORKDIR /backend

COPY ./requirements.txt ./

RUN pip install -r requirements.txt
RUN pip install python-dotenv

COPY . .

EXPOSE 8000

CMD [ "python", "manage.py", "runserver", "0.0.0.0:8000"]



