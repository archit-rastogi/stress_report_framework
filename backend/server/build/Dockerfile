FROM python:3.9-slim

ENV MULTIDICT_NO_EXTENSIONS=1

ENV DB_URL=""
ENV DB_NAME=""
ENV DB_USER=""

COPY ./backend/server/requirements.txt /requirements
ADD ./backend/server /src

RUN pip install -r /requirements

WORKDIR /src
ENTRYPOINT python -u /src/server.py
