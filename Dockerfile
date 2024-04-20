FROM node:21-alpine3.18

WORKDIR /app

COPY package.json package-lock.json .

RUN npm install

COPY . .

RUN npx tsc

EXPOSE 8000

# ENV GATEWAY_PORT=8000
# ENV USER_GRPC_PORT=8080
# ENV AUTH_GRPC_PORT=8081
# ENV ACCESS_TOKEN_EXPIRE=5
# ENV REFRESH_TOKEN_EXPIRE=3
# ENV CORS_ORIGIN="http://localhost:3000"

CMD ["npm", "start"]

