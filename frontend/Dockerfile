# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .
# Étape 1 : Build de l'application Angular
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build --configuration=production

# Étape 2 : Étape de production avec Nginx
FROM nginx:alpine
# Copier les fichiers de l'application buildée depuis l'étape de build
# La destination est le dossier racine par défaut de Nginx
COPY --from=build /app/dist/svs-app/browser /usr/share/nginx/html

# Exposer le port 80 pour que nginx-proxy puisse s'y connecter
EXPOSE 80

# La commande par défaut de l'image nginx:alpine est suffisante
# CMD ["nginx", "-g", "daemon off;"] est implicite

