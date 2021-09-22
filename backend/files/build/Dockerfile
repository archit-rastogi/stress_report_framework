FROM golang:alpine as builder

ENV GOPATH=/gopath
ENV GOBIN=/source

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
