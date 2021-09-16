
FROM node:latest as builder

ADD ./frontend /src
RUN rm -rf /src/build
RUN rm -rf /src/node_modules

WORKDIR /src
ENV NG_CLI_ANALYTICS=ci

RUN npm install --force
RUN npm run-script build

FROM nginx:alpine as production

COPY --from=builder /src/build /usr/share/nginx/html
COPY ./frontend/build/nginx.conf /etc/nginx/nginx.conf

ENV TARGET ""
