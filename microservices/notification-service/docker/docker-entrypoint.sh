#!/bin/bash

function checkEnv() {
  if [[ -z "$DB_HOST" ]]; then
    echo "DB_HOST is not set"
    exit 1
  fi
  if [[ -z "$DB_NAME" ]]; then
    echo "DB_NAME is not set"
    exit 1
  fi
  if [[ -z "$DB_PORT" ]]; then
    echo "DB_PORT is not set"
    exit 1
  fi
  if [[ -z "$DB_USER" ]]; then
    echo "DB_USER is not set"
    exit 1
  fi
  if [[ -z "$DB_PASSWORD" ]]; then
    echo "DB_PASSWORD is not set"
    exit 1
  fi
}

function checkConnection() {
  echo "Connecting to MongoDB . . ."
  timeout 10 bash -c 'until printf "" 2>>/dev/null >>/dev/tcp/$0/$1; do sleep 1; done' $DB_HOST $DB_PORT
}

function configureServer() {
  if [ ! -f .env ]; then
    envsubst '${DB_HOST}
      ${DB_NAME}
      ${DB_PORT}
      ${DB_USER}
      ${DB_PASSWORD}
      ${MONGO_REPLICA_PRIMARY}
      ${MONGO_REPLICA_SECONDARY_1}
      ${MONGO_REPLICA_SECONDARY_2}
      ${MONGO_REPLICA_PRIMARY_PORT}
      ${MONGO_REPLICA_SECONDARY_1_PORT}
      ${MONGO_REPLICA_SECONDARY_2_PORT}
      ${READ_PREFERENCE}
      ${REPLICA_SET_NAME}
      ${MAIL_HOST}
      ${MAIL_PORT}
      ${MAIL_SECURE}
      ${MAIL_IGNORE_TLS}
      ${MAIL_USER}
      ${MAIL_PASSWORD}
      ${MAIL_SENDER_NAME}
      ${RMQ_HOST}' \
      < docker/env.tmpl > .env
  fi
}
export -f configureServer

if [ "$1" = 'start' ]; then
  checkEnv
  checkConnection
  su arcapps -c "bash -c configureServer"
  configureServer
  echo "Running migrations..."
  echo "Starting the server..."
  su arcapps -c "node dist/main.js"
fi

exec runuser -u arcapps "$@"
