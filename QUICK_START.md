# 🚀 Guide de Démarrage Rapide

## ⚡ Lancer le projet en 5 minutes

### 1. Prérequis
```bash
node --version  # >= 20
yarn --version  # 4.x
```

### 2. Installation
```bash
# Installer les dépendances
yarn install

# Copier les variables d'environnement
cp .env.example .env
```

### 3. Configurer les secrets

Générer des secrets sécurisés:
```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cookie Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Éditer `.env` et remplacer `JWT_SECRET` et `COOKIE_SECRET` avec les valeurs générées.

### 4. Base de données

**Option A: Docker (Recommandé)**
```bash
docker-compose up -d postgres redis
```

**Option B: PostgreSQL local**
```bash
# Créer la base de données
createdb medusa-v2

# Vérifier .env
# DATABASE_URL=postgres://postgres:postgres@localhost:5432/medusa-v2
```

### 5. Migrations
```bash
yarn medusa db:migrate
```

### 6. Seed (optionnel)
```bash
yarn seed
```

Cela créera:
- Store par défaut
- Produits de démonstration
- Régions (Europe)
- Stock locations

### 7. Lancer le serveur
```bash
yarn dev
```

Le serveur démarre sur: **http://localhost:9000**

### 8. Tester
```bash
# Health check
curl http://localhost:9000/api/health

# Pricing
curl "http://localhost:9000/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"
```

---

## 🐳 Avec Docker (Tout-en-un)

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f medusa

# Accéder
# API: http://localhost:9000
# Adminer (DB): http://localhost:8080
```

---

## 🧪 Lancer les tests

```bash
# Tests unitaires
yarn test:unit

# Tests avec watch
yarn test:unit --watch

# Avec coverage
yarn test:unit --coverage
```

**Résultat attendu:**
```
Test Suites: 2 passed
Tests:       23 passed
```

---

## 📚 Documentation

- **API:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Projet:** [PROJET_README.md](./PROJET_README.md)
- **Statut:** [STATUS.md](./STATUS.md)

---

## 🎯 Endpoints disponibles

| Endpoint | Description |
|----------|-------------|
| `POST /api/login` | Authentification |
| `POST /api/auth/refresh` | Refresh token |
| `GET /api/pricing` | Calcul de prix |
| `POST /api/my-products` | Créer produit (auth) |
| `GET /api/health` | Health check |

---

## 🔑 Tester l'authentification

```bash
# 1. Login (créer un utilisateur d'abord avec Medusa Admin)
curl -X POST http://localhost:9000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medusa-test.com",
    "password": "supersecret"
  }'

# 2. Utiliser le token
TOKEN="<access_token>"

curl http://localhost:9000/api/my-products \
  -H "Authorization: Bearer $TOKEN"
```

---

## 💰 Tester le pricing

```bash
# Prix pour 100 stickers 5x5 cm, vinyle blanc, rond
curl "http://localhost:9000/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"

# Matrice complète
curl "http://localhost:9000/api/pricing?support=vinyle-holographique&forme=cut-contour&taille=10x10"
```

---

## ⚠️ Troubleshooting

### Port 9000 déjà utilisé
```bash
# Changer le port dans .env
PORT=9001
```

### Erreur de connexion DB
```bash
# Vérifier que PostgreSQL tourne
docker-compose ps postgres

# Vérifier DATABASE_URL dans .env
```

### Tests qui échouent
```bash
# Nettoyer et réinstaller
rm -rf node_modules .medusa
yarn install
yarn test:unit
```

---

## 📊 Statut des fonctionnalités

### ✅ Opérationnel
- Authentification JWT
- Refresh tokens
- Rate limiting
- Système de pricing
- Health checks
- Tests unitaires
- Documentation

### 🚧 À implémenter
- Upload R2
- Webhooks
- Emails (Resend)
- Stripe/PayPal
- Product Options

---

## 🎓 Pour aller plus loin

1. Lire [PROJET_README.md](./PROJET_README.md) pour l'architecture complète
2. Consulter [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) pour les détails des endpoints
3. Voir [STATUS.md](./STATUS.md) pour le statut détaillé du projet

---

**Besoin d'aide?** Voir la documentation complète dans les fichiers ci-dessus.
