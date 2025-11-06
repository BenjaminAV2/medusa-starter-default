# 🚂 Guide de Déploiement Railway

## 📋 Prérequis

- ✅ Compte Railway: https://railway.app
- ✅ Repo GitHub du projet
- ✅ Compte Cloudflare R2 (optionnel pour Phase 2)
- ⏳ Compte Stripe (pour Phase 3)
- ⏳ Compte Resend (pour Phase 3)

---

## 🎯 Option 1: Déploiement Rapide (Recommandé)

### Étape 1: Préparer le Repo GitHub

```bash
# Si pas encore fait, pusher le code
git add .
git commit -m "feat: ready for Railway deployment"
git push origin main
```

### Étape 2: Créer le Projet Railway

1. Aller sur https://railway.app
2. Cliquer "New Project"
3. Sélectionner "Deploy from GitHub repo"
4. Choisir le repo `medusa-starter-default`
5. Railway détectera automatiquement `railway.json`

### Étape 3: Ajouter PostgreSQL

1. Dans le projet Railway, cliquer "New"
2. Sélectionner "Database" → "PostgreSQL"
3. Railway créera automatiquement:
   - Une base de données
   - La variable `DATABASE_URL`

### Étape 4: Ajouter Redis (Optionnel mais Recommandé)

1. Cliquer "New" → "Database" → "Redis"
2. Variable `REDIS_URL` créée automatiquement

### Étape 5: Configurer les Variables d'Environnement

Dans Railway, aller dans le service Medusa → Variables:

```bash
# === OBLIGATOIRES ===

# Générer les secrets (localement d'abord):
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

JWT_SECRET=<généré-avec-crypto>
COOKIE_SECRET=<généré-avec-crypto>

# CORS (adapter à votre domaine)
STORE_CORS=https://votre-frontend.com
ADMIN_CORS=https://admin.votre-domaine.com
AUTH_CORS=https://admin.votre-domaine.com

# === OPTIONNELS (Phase 2) ===

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=client-uploads
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://cdn.votre-domaine.com

# === POUR PHASE 3 ===

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# Resend
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@votre-domaine.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Étape 6: Déployer

Railway déploiera automatiquement après la configuration.

**Commandes exécutées automatiquement:**
```bash
# Build (défini dans railway.json)
yarn install --immutable && yarn build

# Start (défini dans railway.json)
yarn medusa db:migrate && yarn run start
```

### Étape 7: Vérifier le Déploiement

1. Attendre que le déploiement se termine (2-3 min)
2. Railway vous donnera une URL: `https://votre-app.up.railway.app`
3. Tester les endpoints:

```bash
# Health check
curl https://votre-app.up.railway.app/api/health

# Devrait retourner:
{
  "status": "healthy",
  "services": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## 🎯 Option 2: Déploiement via Railway CLI

### Installation

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Login
railway login
```

### Déploiement

```bash
# Dans le dossier du projet
cd medusa-starter-default

# Initialiser Railway
railway init

# Lier à un projet existant OU créer nouveau
railway link

# Ajouter PostgreSQL
railway add --plugin postgresql

# Ajouter Redis
railway add --plugin redis

# Configurer les variables
railway variables set JWT_SECRET=<votre-secret>
railway variables set COOKIE_SECRET=<votre-secret>
# ... autres variables

# Déployer
railway up
```

---

## 🔧 Configuration Post-Déploiement

### 1. Configurer le Domaine Personnalisé

**Dans Railway:**
1. Aller dans Settings → Domains
2. Ajouter votre domaine: `api.votre-domaine.com`
3. Configurer les DNS chez votre registrar:
   ```
   Type: CNAME
   Name: api
   Value: <fourni-par-railway>.up.railway.app
   ```

### 2. Seed des Données (Via Railway CLI)

```bash
# Connecter au projet
railway link

# Exécuter le seed
railway run yarn seed

# Seed des stickers
railway run yarn medusa exec ./src/scripts/seed-stickers.ts
```

**OU via le dashboard Railway:**
1. Aller dans le service Medusa
2. Cliquer "Deploy" → "Command"
3. Exécuter: `yarn seed`

### 3. Configurer les Webhooks

**Pour Stripe:**
1. Dashboard Stripe → Developers → Webhooks
2. Ajouter endpoint: `https://api.votre-domaine.com/webhooks/stripe`
3. Sélectionner événements:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copier le `signing secret` → Variable Railway `STRIPE_WEBHOOK_SECRET`

**Pour l'application:**
Si vous avez une app qui écoute les webhooks:
```typescript
// Enregistrer votre webhook
const response = await fetch('https://api.votre-domaine.com/api/webhooks/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://votre-app.com/webhooks/medusa',
    events: ['order.paid', 'upload.completed'],
    secret: 'votre-webhook-secret'
  })
})
```

---

## 🔒 Sécurité Production

### Checklist Pré-Production

- [ ] **Secrets uniques générés** (JWT_SECRET, COOKIE_SECRET)
- [ ] **CORS configuré** pour vos domaines uniquement
- [ ] **HTTPS activé** (automatique sur Railway)
- [ ] **Variables sensibles** en variables d'environnement (pas dans le code)
- [ ] **Rate limiting** activé (configuré par défaut)
- [ ] **Logs monitoring** activé dans Railway
- [ ] **Backup DB** configuré dans Railway (automatique)
- [ ] **Stripe en mode live** (pas test)
- [ ] **Emails de production** configurés

### Recommandations

```bash
# 1. Secrets forts (64+ caractères)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Tester en staging d'abord
# Créer un projet Railway séparé pour staging

# 3. Monitoring
# Activer les alertes Railway pour:
# - Erreurs 5xx
# - CPU > 80%
# - Memory > 80%
```

---

## 📊 Monitoring & Logs

### Voir les Logs

**Via Dashboard:**
1. Projet Railway → Service Medusa
2. Onglet "Logs"
3. Filtrer par niveau (info, warn, error)

**Via CLI:**
```bash
railway logs
railway logs --follow  # Mode watch
```

### Métriques

Railway fournit automatiquement:
- CPU usage
- Memory usage
- Network I/O
- Request count
- Response times

**Alertes recommandées:**
- Error rate > 5%
- Response time > 2s
- Memory > 80%

---

## 🐛 Troubleshooting

### Erreur: Build Failed

**Solution:**
```bash
# Vérifier localement
yarn install
yarn build

# Si OK local, vérifier dans Railway:
# - Node version (devrait être >= 20)
# - Variables d'env présentes
```

### Erreur: Database Connection

**Solution:**
```bash
# Vérifier que PostgreSQL est bien ajouté
# Vérifier que DATABASE_URL est défini
# Format attendu:
# postgres://user:pass@host:5432/dbname
```

### Erreur: Migrations Failed

**Solution:**
```bash
# Via Railway CLI
railway run yarn medusa db:migrate

# Ou redémarrer le service dans Railway
```

### Erreur: Upload R2 Failed

**Solution:**
```bash
# Vérifier les variables R2:
railway variables
# Vérifier:
# - R2_ACCOUNT_ID
# - R2_ACCESS_KEY_ID
# - R2_SECRET_ACCESS_KEY
# - R2_BUCKET

# Tester la connexion localement avec les mêmes credentials
```

---

## 💰 Coûts Railway

### Plan Gratuit (Hobby)
- ✅ 5$ de crédit/mois
- ✅ Parfait pour staging/test
- ⚠️ Pas pour production (sleep après inactivité)

### Plan Pro (Recommandé Production)
- 💰 20$/mois + usage
- ✅ Pas de sleep
- ✅ Support prioritaire
- ✅ Backups automatiques
- ✅ Meilleure performance

**Estimation mensuelle:**
- Medusa backend: ~15-20$/mois
- PostgreSQL: ~5-10$/mois
- Redis: ~2-5$/mois
- **Total: ~25-35$/mois**

---

## 🚀 Scaling

### Horizontal Scaling

Railway scale automatiquement selon:
- CPU usage
- Memory usage
- Request volume

**Pour forcer le scaling:**
1. Railway Dashboard → Service
2. Settings → Scaling
3. Ajuster les réplicas

### Vertical Scaling

Augmenter les resources:
1. Settings → Resources
2. Ajuster RAM/CPU

**Recommandations:**
- **Staging:** 512MB RAM, 0.5 vCPU
- **Production:** 2GB RAM, 1 vCPU
- **High Traffic:** 4GB RAM, 2 vCPU

---

## ✅ Checklist de Déploiement

### Avant le Déploiement
- [ ] Code compilé localement (`yarn build`)
- [ ] Tests passent (`yarn test:unit`)
- [ ] Variables d'env préparées
- [ ] Secrets générés (JWT, COOKIE)
- [ ] Domaines configurés
- [ ] R2 bucket créé (si Phase 2)

### Déploiement
- [ ] Projet Railway créé
- [ ] PostgreSQL ajouté
- [ ] Redis ajouté (optionnel)
- [ ] Variables configurées
- [ ] Déploiement successful
- [ ] Health check OK

### Post-Déploiement
- [ ] Migrations exécutées
- [ ] Seed exécuté
- [ ] Endpoints testés
- [ ] Webhooks configurés (Stripe)
- [ ] Domaine custom configuré
- [ ] Monitoring activé
- [ ] Backups vérifiés

---

## 🎯 Commandes Utiles

```bash
# Status du projet
railway status

# Variables
railway variables
railway variables set KEY=value

# Logs
railway logs --follow

# Shell dans le container
railway shell

# Exécuter une commande
railway run yarn medusa db:migrate

# Redémarrer le service
railway restart

# Rollback
railway rollback
```

---

## 📞 Support

### Railway
- Docs: https://docs.railway.app
- Discord: https://discord.gg/railway
- Support: support@railway.app

### Medusa
- Docs: https://docs.medusajs.com
- Discord: https://discord.gg/medusajs

---

## 🎉 Résumé

**Pour déployer maintenant:**

1. **Créer projet Railway** (avec PostgreSQL + Redis)
2. **Configurer variables** (JWT_SECRET, COOKIE_SECRET, CORS)
3. **Pusher code GitHub** (si pas fait)
4. **Laisser Railway déployer** (automatique)
5. **Tester health check** (https://votre-app.up.railway.app/api/health)
6. **Seed données** (`railway run yarn seed`)
7. **Configurer domaine** (optionnel)

**Temps estimé:** 15-30 minutes

**Coût estimé:** 25-35$/mois (plan Pro)

---

**Besoin d'aide?** Je peux vous guider étape par étape pour le déploiement!
