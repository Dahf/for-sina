### Dockerfile für das Frontend (React/Next.js)
# frontend/Dockerfile
FROM node:20

WORKDIR /app

# Build-Args für Umgebungsvariablen
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_ALLOWED_EMAILS

# Setze Umgebungsvariablen für Build und Laufzeit
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_ALLOWED_EMAILS=$VITE_ALLOWED_EMAILS

COPY package.json package-lock.json ./
RUN npm install
RUN npm i -g serve

COPY . .
RUN npm run build

EXPOSE 3000
CMD [ "npm", "run", "preview" ]