FROM node:20-bullseye-slim as build

WORKDIR /app

COPY package.json .

ADD . .

RUN npm install

RUN npm run build:docker


FROM node:20-bullseye-slim as production

WORKDIR /app

ENV NODE_ENV=production
COPY --from=build /app/package*.json .
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules node_modules

CMD ["node", "dist/index.js"]