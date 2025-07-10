### Dockerfile für das Frontend (React/Next.js)
# frontend/Dockerfile
FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN npm i -g serve

COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "serve", "-s", "dist", "-l", "3000" ]