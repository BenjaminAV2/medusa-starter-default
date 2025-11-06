# 🎨 E-commerce Stickers Personnalisés - Backend Medusa

> Backend e-commerce complet pour la vente de stickers personnalisés avec système de pricing dégressif

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités implémentées](#fonctionnalités-implémentées)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Tests](#tests)
- [API Documentation](#api-documentation)
- [Déploiement](#déploiement)

---

## 🎯 Vue d'ensemble

Ce projet est le backend d'une plateforme e-commerce spécialisée dans la vente de stickers personnalisés. Il offre:

- **Système de pricing dynamique** avec remises dégressives par quantité
- **Authentification sécurisée** avec JWT et refresh tokens
- **Validation robuste** de toutes les entrées avec Zod
- **Rate limiting** pour protéger les endpoints sensibles
- **Health checks** complets pour le monitoring
- **Tests unitaires** avec Jest

---

## ✅ Fonctionnalités implémentées

### 🔐 Authentification & Sécurité

- [x] Login avec JWT (access + refresh tokens)
- [x] Refresh token endpoint
- [x] Rate limiting sur login (5 tentatives / 15 min)
- [x] Rate limiting général (100 req / min)
- [x] Validation Zod sur tous les endpoints
- [x] Secrets sécurisés (JWT_SECRET, COOKIE_SECRET)
- [x] Pas d'exposition de stack traces

### 💰 Système de Pricing

- [x] Calcul dynamique basé sur:
  - Support (vinyle blanc/transparent/holographique/miroir)
  - Forme (rond/carré/rectangle/cut-contour)
  - Taille (5x5, 8x8, 10x10, 15x15 cm)
  - Quantité (5 à 1000) avec remises jusqu'à 45%
- [x] API `/api/pricing` pour:
  - Prix spécifique (avec quantity)
  - Matrice complète (sans quantity)
- [x] Service de pricing avec tests unitaires

### ⚕️ Monitoring & Health

- [x] Health check complet (`/api/health`)
- [x] Readiness probe (`/api/health/ready`)
- [x] Liveness probe (`/api/health/live`)
- [x] Vérification DB + Redis

### 🧪 Tests & Qualité

- [x] Tests unitaires (23 tests passent ✅)
- [x] ESLint + Prettier configurés
- [x] Configuration TypeScript stricte
- [x] Tests du service de pricing
- [x] Tests des utilitaires d'auth

### 🐳 Infrastructure

- [x] Dockerfile multi-stage optimisé
- [x] docker-compose.yml avec:
  - PostgreSQL
  - Redis
  - Medusa Backend
  - Adminer (interface DB)
- [x] .dockerignore
- [x] Health checks Docker

### 📚 Documentation

- [x] Documentation API complète
- [x] README de projet
- [x] Fichier .env.example
- [x] Commentaires dans le code

---

## 🏗️ Architecture

```
src/
├── api/                    # Endpoints API
│   ├── login/             # Authentification
│   ├── auth/refresh/      # Refresh tokens
│   ├── pricing/           # Calcul de prix
│   ├── my-products/       # Gestion produits
│   └── health/            # Health checks
├── services/              # Services métier
│   └── pricing.ts         # Service de tarification
├── utils/                 # Utilitaires
│   ├── auth.ts           # Helpers JWT
│   └── validation.ts     # Helpers validation
├── validators/            # Schémas Zod
│   ├── auth.ts
│   ├── product.ts
│   └── upload.ts
├── middlewares/           # Middlewares
│   └── rate-limit.ts     # Rate limiting
├── types/                 # Types TypeScript
│   └── pricing.ts
└── __tests__/            # Tests
    ├── services/
    └── utils/
```

---

## 🚀 Installation

### Prérequis

- Node.js >= 20
- Yarn 4.x
- Docker & Docker Compose (optionnel)
- PostgreSQL 14+ (ou via Docker)

### Installation locale

```bash
# Cloner le repo
git clone <repo-url>
cd medusa-starter-default

# Installer les dépendances
yarn install

# Copier et configurer les variables d'environnement
cp .env.example .env

# Générer des secrets sécurisés
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('COOKIE_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"

# Éditer .env avec vos secrets et configurations
```

### Installation avec Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f medusa

# Accéder à Adminer (interface DB)
# http://localhost:8080
```

---

## ⚙️ Configuration

### Variables d'environnement essentielles

```env
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-v2

# Redis
REDIS_URL=redis://localhost:6379

# Security (IMPORTANT: Générer des valeurs uniques!)
JWT_SECRET=your-super-secret-jwt-key-min-64-chars
COOKIE_SECRET=your-super-secret-cookie-key-min-64-chars

# CORS
STORE_CORS=http://localhost:8000
ADMIN_CORS=http://localhost:5173,http://localhost:9000
AUTH_CORS=http://localhost:5173,http://localhost:9000
```

Voir `.env.example` pour la configuration complète.

---

## 💻 Utilisation

### Démarrer le serveur

```bash
# Développement (hot reload)
yarn dev

# Production
yarn build
yarn start

# Avec migrations
yarn medusa db:migrate && yarn start
```

Le serveur démarre sur `http://localhost:9000`.

### Seed de données

```bash
yarn seed
```

Cela crée:
- Store par défaut
- Régions (Europe)
- Produits de démonstration (T-shirts, Sweatshirts, etc.)
- Stock locations
- Shipping options

---

## 🧪 Tests

### Lancer les tests

```bash
# Tests unitaires
yarn test:unit

# Tests avec coverage
yarn test:unit --coverage

# Tests d'intégration HTTP
yarn test:integration:http

# Tests d'intégration modules
yarn test:integration:modules
```

### Résultats actuels

```
Test Suites: 2 passed, 2 total
Tests:       23 passed, 23 total
Time:        0.351 s
```

✅ Tous les tests passent!

---

## 📖 API Documentation

La documentation complète de l'API est disponible dans [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Endpoints principaux

| Endpoint | Méthode | Description | Auth |
|----------|---------|-------------|------|
| `/api/login` | POST | Authentification | Non |
| `/api/auth/refresh` | POST | Refresh token | Non |
| `/api/pricing` | GET | Calcul de prix | Non |
| `/api/my-products` | POST | Créer produit | Oui |
| `/api/health` | GET | Health check | Non |

### Exemple rapide

```bash
# Login
curl -X POST http://localhost:9000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medusa-test.com","password":"supersecret"}'

# Pricing
curl "http://localhost:9000/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"

# Health
curl http://localhost:9000/api/health
```

---

## 🚢 Déploiement

### Railway / Render

1. Connecter le repo GitHub
2. Configurer les variables d'environnement
3. Ajouter PostgreSQL addon
4. Build command: `yarn install --immutable && yarn build`
5. Start command: `yarn medusa db:migrate && yarn start`

### Docker

```bash
# Build
docker build -t medusa-stickers .

# Run
docker run -p 9000:9000 \
  -e DATABASE_URL=postgres://... \
  -e JWT_SECRET=... \
  medusa-stickers
```

### Variables d'environnement de production

⚠️ **Critiques à configurer:**

- `JWT_SECRET` - Secret unique (min 64 caractères)
- `COOKIE_SECRET` - Secret unique (min 64 caractères)
- `DATABASE_URL` - URL PostgreSQL
- `STRIPE_SECRET_KEY` - Clé Stripe live
- `PAYPAL_CLIENT_ID/SECRET` - Identifiants PayPal live

---

## 📊 Système de Pricing

### Prix de base par taille

| Taille | Prix base |
|--------|-----------|
| 5×5 cm | 4.50 € |
| 8×8 cm | 5.50 € |
| 10×10 cm | 6.50 € |
| 15×15 cm | 9.00 € |

### Coefficients support

| Support | Coefficient |
|---------|-------------|
| Vinyle blanc | 1.0 (base) |
| Vinyle transparent | 1.08 (+8%) |
| Vinyle holographique | 1.2 (+20%) |
| Vinyle miroir | 1.15 (+15%) |

### Coefficients forme

| Forme | Coefficient |
|-------|-------------|
| Rond | 1.0 (base) |
| Carré | 1.0 (base) |
| Rectangle | 1.0 (base) |
| Cut-contour | 1.1 (+10%) |

### Remises quantité

| Quantité | Remise |
|----------|--------|
| 5 | 0% |
| 10 | 5% |
| 25 | 10% |
| 50 | 15% |
| 100 | 22% |
| 250 | 30% |
| 500 | 38% |
| 1000 | 45% |

### Formule

```
Prix_unitaire = Prix_base × Coef_support × Coef_forme × (1 - Remise_quantité)
```

**Exemple:**
- Support: Vinyle holographique (×1.2)
- Forme: Cut-contour (×1.1)
- Taille: 10×10 cm (6.50€)
- Quantité: 100 (-22%)

```
Prix = 6.50 × 1.2 × 1.1 × 0.78 = 6.69€/unité
Total = 6.69€ × 100 = 669€
```

---

## 🔜 Roadmap

### À implémenter

- [ ] Upload fichiers Cloudflare R2
- [ ] Webhooks Stripe/PayPal
- [ ] Emails transactionnels (Resend)
- [ ] Product Options & Variants Medusa
- [ ] Gestion complète des commandes
- [ ] Tests d'intégration E2E
- [ ] Module de prévisualisation
- [ ] Admin UI personnalisé

---

## 🤝 Contribution

### Code Quality

```bash
# Linter
yarn lint

# Format code
yarn format

# Check types
yarn tsc --noEmit
```

### Git Workflow

1. Créer une branche: `git checkout -b feature/ma-feature`
2. Commit: `git commit -m "feat: description"`
3. Push: `git push origin feature/ma-feature`
4. Créer une Pull Request

---

## 📝 Changelog

### Version 1.0.0 (2025-01-06)

#### ✨ Ajouté

- Système d'authentification avec JWT
- Refresh tokens
- Système de pricing dégressif complet
- Rate limiting
- Validation Zod
- Health checks
- Tests unitaires (23 tests)
- Docker & docker-compose
- Documentation API complète

#### 🔒 Sécurité

- Secrets sécurisés
- Pas d'exposition de stack traces
- Rate limiting sur login
- Validation stricte des entrées

#### 🧪 Tests

- Service de pricing: 13 tests
- Utilitaires d'auth: 10 tests
- Taux de réussite: 100%

---

## 📄 Licence

MIT

---

## 👨‍💻 Auteur

Xavier - E-commerce Stickers Personnalisés

---

## 📞 Support

- Issues: [GitHub Issues](https://github.com/...)
- Email: support@example.com
- Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Happy coding! 🚀**
