# Utiliser une image Node.js officielle légère
FROM node:20-alpine

# Créer le répertoire de travail
WORKDIR /usr/src/app

# Copier les définitions de dépendances
COPY package*.json ./

# Installer les dépendances de production uniquement
RUN npm ci --only=production

# Copier le code source
COPY . .

# Cloud Run écoute généralement sur le port 8080
ENV PORT=8080
EXPOSE 8080

# Démarrer l'application
CMD [ "npm", "start" ]
