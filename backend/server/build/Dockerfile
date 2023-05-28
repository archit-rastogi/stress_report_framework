FROM python:3.11-slim

ENV MULTIDICT_NO_EXTENSIONS=1

# env params to set on start
ENV DB_URL = ""
ENV DB_NAME = ""
ENV DB_USER = ""
ENV FILES_URL = ""
ENV SETUP_FILE = ""

COPY ./backend/server/requirements.txt /requirements
ADD ./backend/server /src

RUN pip install -r /requirements

WORKDIR /src
ENTRYPOINT python -u /src/server.py
