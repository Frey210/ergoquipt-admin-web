#!/bin/sh
set -e

: "${NGINX_HOST:=0.0.0.0}"
: "${NGINX_PORT:=80}"

envsubst '${NGINX_HOST} ${NGINX_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec nginx -g 'daemon off;'
