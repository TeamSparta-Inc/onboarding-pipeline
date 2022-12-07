FROM node:18.12.1 AS build

WORKDIR /src/build

COPY package*.json .
COPY tsconfig.json .

ARG NODE_ENV=development
ARG PORT=9999

RUN npm install

COPY /src/ ./src/

RUN npm run build


FROM node:18.12.1-alpine

WORKDIR /src/app

COPY --from=build /src/build/node_modules/ ./node_modules/
COPY --from=build /src/build/package*.json ./
COPY --from=build /src/build/dist/ ./dist/

# 이후 docker build -t onboarding --build-arg NODE_ENV=production .
ENV NODE_ENV $NODE_ENV
ENV PORT $PORT

EXPOSE 3000/tcp

ENTRYPOINT ["node", "dist/Main.js"]

# directory debugging
# 1. docker create --name onboarding-container onboarding
# 2. docker export onboarding-container | tar t > onboarding-container-files.txt