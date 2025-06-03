#!/bin/bash


# run database
docker compose -f docker/docker-compose.yaml up -d

# run application and other services
docker compose up -d --build