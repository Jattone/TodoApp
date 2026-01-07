FROM dunglas/frankenphp

ARG NODE_VERSION=22
ARG SERVER_NAME=""

ENV SERVER_NAME=$SERVER_NAME

RUN install-php-extensions \
    @composer \
    pcntl \
    redis \
    mysqli \
    pdo_mysql

COPY . /app

COPY --from=node:22-slim /usr/local/bin /usr/local/bin
COPY --from=node:22-slim /usr/local/lib/node_modules /usr/local/lib/node_modules

RUN npm install \
    && npm run build

RUN composer install --no-dev --optimize-autoloader
