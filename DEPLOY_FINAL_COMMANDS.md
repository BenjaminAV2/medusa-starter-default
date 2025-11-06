# 🚀 Déploiement Final - Commandes Exactes

## ✅ Ce qui est FAIT

1. ✅ Code poussé sur GitHub (commit ae35f92)
2. ✅ Build vérifié et fonctionnel
3. ✅ Tests passants (23/23)
4. ✅ Secrets générés
5. ✅ Railway CLI installé
6. ✅ Documentation complète

## 🎯 SECRETS GÉNÉRÉS (À COPIER)

**IMPORTANT: Sauvegardez ces secrets dans un endroit sûr**

```bash
JWT_SECRET=155d7731f1ef94f1957bdf4d5a151f2cb58a17e4c199eb1ec41a86de6a56cedc5948b161f34fe9a26fb5c46703010f24aed588023953bf422a43c6b31b10b379
COOKIE_SECRET=b9b6a237c41376e50f35dfe0a71f09fc53899bda6b03c77a65684fe6ac081a33a16d1330fed9802c7243a7b8e5674b66d2bfd47560d511892f5bb6f7d9dea3a8
```

---

## 🚂 Option 1: Déploiement via Railway Dashboard (Recommandé - 10 min)

### Étape 1: Créer le Projet

1. Allez sur https://railway.app
2. Cliquez **"New Project"**
3. Sélectionnez **"Deploy from GitHub repo"**
4. Choisissez `BenjaminAV2/medusa-starter-default`
5. Railway détecte automatiquement `railway.json` ✅

### Étape 2: Ajouter PostgreSQL

1. Dans le projet → Cliquez **"New"**
2. **Database** → **PostgreSQL** → Créer
3. Railway créera automatiquement `DATABASE_URL` ✅

### Étape 3: Ajouter Redis

1. Cliquez **"New"** → **Database** → **Redis** → Créer
2. Railway créera automatiquement `REDIS_URL` ✅

### Étape 4: Configurer les Variables (IMPORTANT)

Cliquez sur le service **Medusa** → Onglet **"Variables"** → Copiez-collez:

```bash
# OBLIGATOIRE - Sécurité
JWT_SECRET=155d7731f1ef94f1957bdf4d5a151f2cb58a17e4c199eb1ec41a86de6a56cedc5948b161f34fe9a26fb5c46703010f24aed588023953bf422a43c6b31b10b379
COOKIE_SECRET=b9b6a237c41376e50f35dfe0a71f09fc53899bda6b03c77a65684fe6ac081a33a16d1330fed9802c7243a7b8e5674b66d2bfd47560d511892f5bb6f7d9dea3a8

# OBLIGATOIRE - CORS (à adapter à votre domaine)
STORE_CORS=https://votre-frontend.com,http://localhost:3000
ADMIN_CORS=https://admin.votre-domaine.com,http://localhost:9000
AUTH_CORS=https://admin.votre-domaine.com,http://localhost:9000

# OPTIONNEL - Cloudflare R2 (si vous voulez l'upload maintenant)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=client-uploads
R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
```

**Note:** DATABASE_URL et REDIS_URL sont automatiquement créés par Railway ✅

### Étape 5: Déployer

Railway déploie automatiquement après la configuration ✅

Attendez 2-3 minutes pour:
- Build (yarn build)
- Migrations (yarn medusa db:migrate)
- Démarrage (yarn start)

### Étape 6: Récupérer l'URL et Tester

1. Service Medusa → **Settings** → **Generate Domain**
2. Copiez l'URL: `https://votre-app.up.railway.app`
3. Testez:

```bash
URL="https://votre-app.up.railway.app"

# Health check
curl $URL/api/health

# Pricing
curl "$URL/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"

# SEO Structure
curl $URL/api/seo/structure
```

**Réponses attendues:**
- Health: `{"status":"healthy","services":{"database":{"status":"up"},...}}`
- Pricing: `{"success":true,"data":{...}}`

### Étape 7: Seed des Données (Optionnel)

Via Railway CLI (après login):
```bash
railway login
railway run yarn seed:stickers
```

OU via Dashboard:
1. Service Medusa → **Deployments** → **View Logs**
2. Cliquer **"Run Command"**
3. Exécuter: `yarn seed:stickers`

---

## 🖥️ Option 2: Déploiement via Railway CLI (5 min)

### Prérequis: Login Railway

**Dans votre terminal:**

```bash
# Login (ouvre le navigateur)
railway login

# Revenir dans le projet
cd /Users/auriolbenjamin/medusa-starter-default
```

### Commandes de Déploiement

```bash
# 1. Initialiser Railway
railway init

# 2. Ajouter PostgreSQL
railway add --plugin postgresql

# 3. Ajouter Redis
railway add --plugin redis

# 4. Configurer les variables OBLIGATOIRES
railway variables set JWT_SECRET="155d7731f1ef94f1957bdf4d5a151f2cb58a17e4c199eb1ec41a86de6a56cedc5948b161f34fe9a26fb5c46703010f24aed588023953bf422a43c6b31b10b379"
railway variables set COOKIE_SECRET="b9b6a237c41376e50f35dfe0a71f09fc53899bda6b03c77a65684fe6ac081a33a16d1330fed9802c7243a7b8e5674b66d2bfd47560d511892f5bb6f7d9dea3a8"
railway variables set STORE_CORS="https://votre-frontend.com,http://localhost:3000"
railway variables set ADMIN_CORS="https://admin.votre-domaine.com,http://localhost:9000"
railway variables set AUTH_CORS="https://admin.votre-domaine.com,http://localhost:9000"

# 5. (OPTIONNEL) Configurer R2 pour l'upload
railway variables set R2_ACCOUNT_ID="your_account_id"
railway variables set R2_ACCESS_KEY_ID="your_access_key"
railway variables set R2_SECRET_ACCESS_KEY="your_secret_key"
railway variables set R2_BUCKET="client-uploads"
railway variables set R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"

# 6. Déployer
railway up

# 7. Attendre le déploiement (2-3 min)
railway logs --follow

# 8. Vérifier le statut
railway status

# 9. Récupérer l'URL
railway domain

# 10. Seed des données
railway run yarn seed:stickers
```

---

## 🧪 Tests Post-Déploiement

```bash
# Définir l'URL (remplacer par votre URL Railway)
URL="https://votre-app.up.railway.app"

# 1. Health Check
curl $URL/api/health
# ✅ Attendu: {"status":"healthy",...}

# 2. Pricing Simple
curl "$URL/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"
# ✅ Attendu: {"success":true,"data":{"pricing":{...}}}

# 3. Pricing Matrice Complète
curl "$URL/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5"
# ✅ Attendu: Matrice avec 8 quantités (5, 10, 25, 50, 100, 250, 500, 1000)

# 4. Structure SEO
curl $URL/api/seo/structure
# ✅ Attendu: Array de catégories avec scoring

# 5. Rapport SEO Complet
curl $URL/api/seo/report | jq .
# ✅ Attendu: Rapport complet avec insights et recommandations

# 6. Test Login (créer un user d'abord)
curl -X POST $URL/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
# ⚠️ Nécessite un user existant dans la DB
```

---

## 📊 Monitoring Post-Déploiement

### Via Dashboard Railway

1. Allez dans Service Medusa
2. Vérifiez:
   - **CPU Usage** < 50%
   - **Memory Usage** < 512MB
   - **Logs** sans erreurs

### Via CLI

```bash
# Logs en temps réel
railway logs --follow

# Status
railway status

# Variables configurées
railway variables

# Shell dans le container
railway shell
```

### Logs à Surveiller

**✅ Logs positifs:**
```
[info]: Backend build completed successfully
[info]: Server is ready on port 9000
[Subscriber] Order paid event received
[Upload] File uploaded successfully
```

**❌ Logs à corriger:**
```
[error]: Database connection failed
[error]: Redis connection failed
[error]: R2 upload failed
```

---

## 🔧 Troubleshooting Rapide

### Build Failed

```bash
# Vérifier localement
yarn build

# Si OK, vérifier dans Railway:
# - Variables définies (JWT_SECRET, COOKIE_SECRET)
# - PostgreSQL ajouté
# - Redis ajouté
```

### Database Connection Error

```bash
# Vérifier que PostgreSQL est ajouté
railway variables | grep DATABASE_URL

# Si vide:
railway add --plugin postgresql
```

### Health Check Failed

```bash
# Tester l'URL
curl https://votre-app.up.railway.app/api/health

# Vérifier les logs
railway logs | grep error

# Redémarrer si nécessaire
railway restart
```

### Upload R2 Error (si Phase 2 activée)

```bash
# Vérifier toutes les variables R2
railway variables | grep R2_

# Variables requises:
# R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_ENDPOINT
```

---

## 🎯 Checklist Finale

### Avant de Tester

- [ ] Projet Railway créé
- [ ] PostgreSQL ajouté (DATABASE_URL automatique)
- [ ] Redis ajouté (REDIS_URL automatique)
- [ ] JWT_SECRET configuré
- [ ] COOKIE_SECRET configuré
- [ ] CORS configuré (STORE_CORS, ADMIN_CORS, AUTH_CORS)
- [ ] Déploiement réussi (Build + Start)
- [ ] URL générée

### Tests de Validation

- [ ] `/api/health` → 200 OK
- [ ] `/api/pricing?...` → 200 OK avec prix
- [ ] `/api/seo/structure` → 200 OK avec catégories
- [ ] `/api/seo/report` → 200 OK avec rapport complet
- [ ] Logs sans erreurs critiques

### Optionnel (Phase 2)

- [ ] R2 variables configurées (si upload activé)
- [ ] Seed exécuté (`railway run yarn seed:stickers`)
- [ ] Domaine custom configuré

### Optionnel (Phase 3 - Plus tard)

- [ ] Stripe configuré
- [ ] PayPal configuré
- [ ] Resend (emails) configuré

---

## 💡 Notes Importantes

1. **Secrets**: Sauvegardez JWT_SECRET et COOKIE_SECRET dans un password manager
2. **CORS**: Adaptez les URLs dans STORE_CORS, ADMIN_CORS, AUTH_CORS à vos domaines réels
3. **R2**: Phase 2 optionnelle, pas nécessaire pour le déploiement initial
4. **Plan Railway**:
   - Hobby (gratuit): 5$/mois crédit, sleep après inactivité (OK pour staging)
   - Pro (20$/mois): Recommandé pour production (pas de sleep)

---

## 🆘 Besoin d'Aide?

### Documentation Complète

- **[DEPLOY_NOW.md](./DEPLOY_NOW.md)** - Guide express 15 minutes
- **[DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)** - Guide détaillé avec troubleshooting
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Tous les endpoints
- **[QUICK_START.md](./QUICK_START.md)** - Développement local

### Support

- **Railway**: https://discord.gg/railway
- **Medusa**: https://discord.gg/medusajs
- **GitHub Repo**: https://github.com/BenjaminAV2/medusa-starter-default

---

## ✨ Prochaines Étapes (Après Déploiement)

1. **Immédiat**: Tester tous les endpoints
2. **Cette semaine**: Configurer domaine custom (api.votre-domaine.com)
3. **Cette semaine**: Seed des produits (`yarn seed:stickers`)
4. **Phase 3**: Stripe/PayPal (paiements)
5. **Phase 3**: Resend (emails transactionnels)
6. **Phase 3**: Tests E2E

---

**Vous êtes prêt à déployer! 🚀**

**Commencez par Option 1 (Dashboard) ou Option 2 (CLI) selon votre préférence.**

**Temps estimé: 10-15 minutes**
