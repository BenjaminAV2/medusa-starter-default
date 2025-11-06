# Documentation API - E-commerce Stickers Personnalisés

## 📋 Table des matières

1. [Authentification](#authentification)
2. [Pricing (Tarification)](#pricing)
3. [Produits](#produits)
4. [Health Checks](#health-checks)
5. [Codes d'erreur](#codes-derreur)

---

## 🔐 Authentification

Tous les endpoints protégés nécessitent un token JWT dans l'en-tête `Authorization`.

```
Authorization: Bearer <access_token>
```

### POST /api/login

Authentifie un utilisateur et retourne une paire de tokens.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPassword123"
}
```

**Validation:**
- Email: Format email valide
- Password: Minimum 8 caractères

**Rate Limiting:** 5 tentatives par 15 minutes

**Response (200):**
```json
{
  "user": {
    "id": "user_01HQ...",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600
}
```

**Erreurs:**
- `400`: Données invalides
- `401`: Identifiants incorrects
- `404`: Utilisateur introuvable
- `429`: Trop de tentatives
- `500`: Erreur serveur

---

### POST /api/auth/refresh

Renouvelle un access token avec un refresh token.

**Body:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "expires_in": 3600
}
```

**Erreurs:**
- `400`: Token invalide ou type incorrect
- `401`: Token expiré
- `404`: Utilisateur introuvable

---

## 💰 Pricing (Tarification)

### GET /api/pricing

Calcule le prix pour une configuration donnée ou retourne la matrice complète.

**Query Parameters:**
- `support` (required): Type de support
  - `vinyle-blanc` (coef: 1.0)
  - `vinyle-transparent` (coef: 1.08, +8%)
  - `vinyle-holographique` (coef: 1.2, +20%)
  - `vinyle-miroir` (coef: 1.15, +15%)
- `forme` (required): Type de forme
  - `rond` (coef: 1.0)
  - `carre` (coef: 1.0)
  - `rectangle` (coef: 1.0)
  - `cut-contour` (coef: 1.1, +10%)
- `taille` (required): Taille du sticker
  - `5x5` (base: 4.50€)
  - `8x8` (base: 5.50€)
  - `10x10` (base: 6.50€)
  - `15x15` (base: 9.00€)
- `quantity` (optional): Quantité spécifique (5-1000)

**Exemple avec quantité spécifique:**
```
GET /api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pricing": {
      "base_price_cents": 450,
      "support_coefficient": 1.0,
      "forme_coefficient": 1.0,
      "discount_percentage": 22,
      "unit_price_cents": 351,
      "total_price_cents": 35100,
      "quantity": 100
    },
    "configuration": {
      "support": "vinyle-blanc",
      "forme": "rond",
      "taille": "5x5",
      "quantity": 100
    }
  }
}
```

**Exemple sans quantité (matrice complète):**
```
GET /api/pricing?support=vinyle-holographique&forme=cut-contour&taille=10x10
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "matrix": [
      {
        "base_price_cents": 650,
        "support_coefficient": 1.2,
        "forme_coefficient": 1.1,
        "discount_percentage": 0,
        "unit_price_cents": 858,
        "total_price_cents": 4290,
        "quantity": 5
      },
      {
        "...": "...",
        "quantity": 10
      },
      // ... toutes les quantités (5, 10, 25, 50, 100, 250, 500, 1000)
    ],
    "configuration": {
      "support": "vinyle-holographique",
      "forme": "cut-contour",
      "taille": "10x10"
    },
    "available_quantities": [5, 10, 25, 50, 100, 250, 500, 1000]
  }
}
```

**Quantités disponibles et remises:**

| Quantité | Remise |
|----------|--------|
| 5        | 0%     |
| 10       | 5%     |
| 25       | 10%    |
| 50       | 15%    |
| 100      | 22%    |
| 250      | 30%    |
| 500      | 38%    |
| 1000     | 45%    |

**Formule de calcul:**
```
Prix_unitaire = Prix_base × Coef_support × Coef_forme × (1 - Remise_quantité)
Prix_total = Prix_unitaire × Quantité
```

**Erreurs:**
- `400`: Paramètres invalides
- `500`: Erreur serveur

---

## 🛍️ Produits

### POST /api/my-products

Crée un nouveau produit (authentification requise).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "title": "Sticker personnalisé",
  "description": "Description du sticker",
  "is_giftcard": false,
  "discountable": true
}
```

**Response (200):**
```json
{
  "product": {
    "id": "prod_01HQ...",
    "title": "Sticker personnalisé",
    "description": "Description du sticker",
    "is_giftcard": false,
    "discountable": true,
    "created_at": "2025-01-06T12:00:00.000Z"
  }
}
```

**Erreurs:**
- `401`: Non authentifié
- `400`: Données invalides
- `500`: Erreur serveur

---

## ⚕️ Health Checks

### GET /api/health

Check de santé complet du système.

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T12:00:00.000Z",
  "uptime": 3600,
  "services": {
    "database": {
      "status": "up",
      "responseTime": 5
    },
    "redis": {
      "status": "up",
      "responseTime": 2
    }
  },
  "version": "1.0.0"
}
```

**Status possibles:**
- `healthy`: Tous les services fonctionnent
- `degraded`: Certains services non-critiques sont down
- `unhealthy`: Services critiques sont down (code 503)

---

### GET /api/health/ready

Readiness probe (Kubernetes).

**Response (200):**
```json
{
  "ready": true,
  "timestamp": "2025-01-06T12:00:00.000Z"
}
```

---

### GET /api/health/live

Liveness probe (Kubernetes).

**Response (200):**
```json
{
  "alive": true,
  "timestamp": "2025-01-06T12:00:00.000Z",
  "uptime": 3600
}
```

---

## ❌ Codes d'erreur

### Format des erreurs

Toutes les erreurs suivent ce format:

```json
{
  "error": "Error type",
  "message": "Message d'erreur en français",
  "details": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

### Codes HTTP

| Code | Description |
|------|-------------|
| 200  | Succès |
| 400  | Requête invalide (validation) |
| 401  | Non authentifié |
| 403  | Accès refusé |
| 404  | Ressource introuvable |
| 429  | Trop de requêtes (rate limiting) |
| 500  | Erreur serveur |
| 503  | Service indisponible |

---

## 📊 Rate Limiting

### Limites par endpoint

| Endpoint | Limite | Période |
|----------|--------|---------|
| POST /api/login | 5 requêtes | 15 minutes |
| POST /api/upload | 10 requêtes | 1 heure |
| Autres endpoints | 100 requêtes | 1 minute |

### Headers de rate limiting

Les réponses incluent ces headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704542400
```

---

## 🔒 Sécurité

### Best Practices

1. **Toujours utiliser HTTPS** en production
2. **Stocker les tokens de manière sécurisée** (httpOnly cookies ou secure storage)
3. **Renouveler les access tokens** régulièrement avec le refresh token
4. **Ne jamais exposer les secrets** dans le code ou les logs
5. **Valider toutes les entrées** côté client ET serveur

### CORS

Les origines autorisées sont configurées via les variables d'environnement:
- `STORE_CORS`
- `ADMIN_CORS`
- `AUTH_CORS`

---

## 📝 Exemples d'utilisation

### JavaScript/TypeScript

```typescript
// Login
const loginResponse = await fetch('http://localhost:9000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'Password123'
  })
})
const { access_token, refresh_token } = await loginResponse.json()

// Pricing
const pricingResponse = await fetch(
  'http://localhost:9000/api/pricing?' + new URLSearchParams({
    support: 'vinyle-blanc',
    forme: 'rond',
    taille: '5x5',
    quantity: '100'
  })
)
const pricing = await pricingResponse.json()

// Créer un produit
const productResponse = await fetch('http://localhost:9000/api/my-products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`
  },
  body: JSON.stringify({
    title: 'Mon sticker',
    description: 'Description'
  })
})
```

### cURL

```bash
# Login
curl -X POST http://localhost:9000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123"}'

# Pricing
curl "http://localhost:9000/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"

# Health check
curl http://localhost:9000/api/health
```

---

## 🚀 Prochaines fonctionnalités

- [ ] Upload de fichiers (Cloudflare R2)
- [ ] Webhooks Stripe/PayPal
- [ ] Emails transactionnels (Resend)
- [ ] Gestion des commandes
- [ ] Interface admin
- [ ] Module de prévisualisation

---

**Version:** 1.0.0
**Dernière mise à jour:** 6 janvier 2025
