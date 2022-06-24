FROM node:latest

RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

WORKDIR /app

COPY package*.json ./
COPY pnpm*.yaml ./
COPY tsconfig.json ./
COPY .npmrc ./
RUN pnpm install

COPY src /app/src
RUN pnpm run build

CMD [ "node", "/app/dist/index.js" ]
