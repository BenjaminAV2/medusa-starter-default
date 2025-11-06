# Dockerfile pour Medusa.js

# Étape 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Installer les dépendances
RUN yarn install --immutable

# Copier le code source
COPY . .

# Build
RUN yarn build

# Étape 2: Production
FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn ./.yarn

# Installer uniquement les dépendances de production
RUN yarn workspaces focus --production

# Copier le build depuis l'étape précédente
COPY --from=builder /app/.medusa ./.medusa
COPY --from=builder /app/dist ./dist

# Copier les fichiers nécessaires
COPY medusa-config.ts ./
COPY instrumentation.ts ./

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# Exposer le port
EXPOSE 9000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=9000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:9000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["sh", "-c", "yarn medusa db:migrate && yarn start"]
