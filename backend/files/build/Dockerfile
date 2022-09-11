FROM golang:alpine as builder

ENV GOPATH=/gopath
ENV GOBIN=/source

# env params to set on start
ENV STORAGE_PATH = ""
ENV DB_USER = ""
ENV DB_PASSWORD = ""
ENV DB_NAME = ""
ENV DB_HOST = ""
ENV DB_PORT = ""

RUN apk --no-cache add gcc musl-dev \
    && mkdir /source \
    && mkdir /gopath \
    && apk add git

ADD ./backend/files /src

WORKDIR /src/app

RUN go get && go build -o /src/files


FROM alpine

COPY --from=builder /src/files /files
RUN chmod a+x /files

ENTRYPOINT /files
