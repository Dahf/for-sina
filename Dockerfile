### Dockerfile für das Frontend (React/Next.js)
# frontend/Dockerfile
FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN npm i -g serve

ENV VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY
ENV VITE_ALLOWED_EMAILS

COPY . .
RUN npm run build
EXPOSE 3000
CMD [ "serve", "-s", "dist", "-l", "3000" ]