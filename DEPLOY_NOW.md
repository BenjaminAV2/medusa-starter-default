# 🚀 Déploiement Railway - Guide Express

## ⚡ Démarrage Rapide (15 minutes)

### Étape 1: Générer les Secrets (2 min)

```bash
# Dans le terminal, à la racine du projet
yarn generate:secrets
```

**Important:** Copier et sauvegarder:
- `JWT_SECRET=...`
- `COOKIE_SECRET=...`

Vous en aurez besoin à l'étape 4.

---

### Étape 2: Créer le Projet Railway (3 min)

**Option A: Via Dashboard (recommandé)**

1. Aller sur https://railway.app
2. Cliquer **"New Project"**
3. Sélectionner **"Deploy from GitHub repo"**
4. Choisir votre repo `medusa-starter-default`
5. Railway détecte automatiquement `railway.json` ✅

**Option B: Via CLI**

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialiser le projet
cd medusa-starter-default
railway init

# Lier au repo
railway link
```

---

### Étape 3: Ajouter les Services (2 min)

**Via Dashboard:**
1. Dans le projet → Cliquer **"New"**
2. **Database** → **PostgreSQL** → Créer
3. **Database** → **Redis** → Créer

**Via CLI:**
```bash
railway add --plugin postgresql
railway add --plugin redis
```

✅ Railway créera automatiquement:
- `DATABASE_URL`
- `REDIS_URL`

---

### Étape 4: Configurer les Variables (5 min)

**Via Dashboard:**
1. Cliquer sur le service **Medusa**
2. Onglet **"Variables"**
3. Cliquer **"Add Variable"**

**Via CLI:**
```bash
# Obligatoires
railway variables set JWT_SECRET="<coller-secret-généré>"
railway variables set COOKIE_SECRET="<coller-secret-généré>"

# CORS (adapter à votre domaine)
railway variables set STORE_CORS="https://votre-frontend.com"
railway variables set ADMIN_CORS="https://admin.votre-domaine.com"
railway variables set AUTH_CORS="https://admin.votre-domaine.com"
```

**Variables minimales pour démarrer:**
```
JWT_SECRET=<généré à l'étape 1>
COOKIE_SECRET=<généré à l'étape 1>
STORE_CORS=https://votre-frontend.com
ADMIN_CORS=https://votre-frontend.com
AUTH_CORS=https://votre-frontend.com
```

**Variables optionnelles (Phase 2 - Upload R2):**
```bash
railway variables set R2_ACCOUNT_ID="your_account_id"
railway variables set R2_ACCESS_KEY_ID="your_access_key"
railway variables set R2_SECRET_ACCESS_KEY="your_secret_key"
railway variables set R2_BUCKET="client-uploads"
railway variables set R2_ENDPOINT="https://your-account.r2.cloudflarestorage.com"
```

---

### Étape 5: Déployer (1 min)

**Via Dashboard:**
- Railway déploie automatiquement après la configuration ✅

**Via CLI:**
```bash
railway up
```

**Attendre 2-3 minutes** pour le build et le déploiement.

---

### Étape 6: Vérifier le Déploiement (2 min)

**Récupérer l'URL:**

Via Dashboard:
- Service Medusa → Settings → **Public URL**

Via CLI:
```bash
railway status
```

**Tester les endpoints:**

```bash
# Remplacer <URL> par votre URL Railway
URL="https://votre-app.up.railway.app"

# Health check
curl $URL/api/health

# Pricing
curl "$URL/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"

# Structure SEO
curl $URL/api/seo/structure | jq .

# Rapport SEO
curl $URL/api/seo/report | jq .
```

**Réponses attendues:**
- Health: `{"status":"healthy"}`
- Pricing: `{"success":true, "data":{...}}`
- SEO: Structure complète des catégories

---

### Étape 7: Seed des Données (optionnel, 2 min)

**Via CLI Railway:**
```bash
# Seed de base (produits de démo)
railway run yarn seed

# Seed des stickers (vos produits)
railway run yarn seed:stickers
```

**Via Dashboard:**
1. Service Medusa → **Deployments**
2. Dernier deployment → **View Logs**
3. Cliquer **"Run Command"**
4. Exécuter: `yarn seed:stickers`

---

## ✅ Checklist de Vérification

Après le déploiement, vérifier:

- [ ] **Build réussi** (Railway Logs: "Backend build completed successfully")
- [ ] **Health check OK** (`curl $URL/api/health`)
- [ ] **Pricing fonctionne** (`curl $URL/api/pricing?...`)
- [ ] **SEO agent répond** (`curl $URL/api/seo/structure`)
- [ ] **Pas d'erreurs 5xx** dans les logs
- [ ] **Database connectée** (health check: `"database":{"status":"up"}`)
- [ ] **Redis connecté** (health check: `"redis":{"status":"up"}`)

---

## 🔧 Configuration Post-Déploiement

### Configurer un Domaine Personnalisé

**Dans Railway:**
1. Service Medusa → **Settings** → **Domains**
2. Cliquer **"Generate Domain"** (sous-domaine .up.railway.app)
3. OU ajouter domaine custom: `api.votre-domaine.com`

**Configuration DNS (si domaine custom):**
```
Type: CNAME
Name: api
Value: <votre-app>.up.railway.app
TTL: 3600
```

### Activer HTTPS (automatique)

Railway active automatiquement HTTPS sur tous les domaines ✅

---

## 📊 Monitoring

### Voir les Logs

**Via Dashboard:**
- Service Medusa → **Deployments** → Cliquer sur deployment → **View Logs**

**Via CLI:**
```bash
railway logs
railway logs --follow  # Mode watch
```

**Logs importants à surveiller:**
```
✅ [info]: Backend build completed successfully
✅ [info]: Server is ready on port 9000
✅ [Subscriber] Order paid event received
✅ [Upload] File uploaded successfully
❌ [error]: ... (à corriger)
```

### Métriques

Dans Railway Dashboard:
- **CPU Usage** (devrait rester < 50%)
- **Memory Usage** (devrait rester < 512MB)
- **Request Count**
- **Response Time** (devrait être < 500ms)

---

## 🐛 Troubleshooting

### Build Failed

```bash
# Vérifier localement
yarn build

# Si OK, vérifier dans Railway:
# - Variables d'environnement définies
# - Node version >= 20
# - Logs d'erreur
```

### Database Connection Failed

```bash
# Vérifier que PostgreSQL est ajouté
railway variables | grep DATABASE_URL

# Si vide, ajouter PostgreSQL:
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

### Upload R2 Errors

```bash
# Vérifier toutes les variables R2
railway variables | grep R2_

# Variables requises:
# R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
```

---

## 💡 Commandes Utiles

```bash
# Status du projet
railway status

# Variables d'environnement
railway variables

# Ajouter une variable
railway variables set KEY=value

# Supprimer une variable
railway variables delete KEY

# Logs en temps réel
railway logs --follow

# Shell dans le container
railway shell

# Exécuter une commande
railway run yarn medusa db:migrate

# Redémarrer
railway restart

# Rollback au déploiement précédent
railway rollback
```

---

## 📚 Documentation Complète

Pour plus de détails, consulter:

1. **[DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)** - Guide détaillé (troubleshooting, scaling, etc.)
2. **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Vue d'ensemble du projet
3. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentation des endpoints
4. **[PHASE_2_COMPLETE.md](./PHASE_2_COMPLETE.md)** - Détails Phase 2

---

## 🎯 Prochaines Étapes

Après le déploiement:

1. **Tester tous les endpoints**
   ```bash
   # Utiliser les exemples dans API_DOCUMENTATION.md
   ```

2. **Configurer le monitoring**
   - Alertes Railway pour erreurs
   - Backup automatique (activé par défaut)

3. **Phase 3** (optionnel maintenant):
   - Stripe/PayPal
   - Emails (Resend)
   - Tests E2E

---

## 💰 Coûts Railway

**Plan Hobby (Gratuit):**
- 5$ de crédit/mois
- ✅ Parfait pour staging/test
- ⚠️ Sleep après inactivité (pas pour prod)

**Plan Pro (Recommandé Production):**
- 20$/mois + usage (~25-35$/mois total)
- ✅ Toujours actif
- ✅ Support prioritaire
- ✅ Backups automatiques

---

## ✅ Vous êtes prêt!

**Résumé des étapes:**
1. `yarn generate:secrets` → Copier JWT_SECRET et COOKIE_SECRET
2. Railway.app → New Project → GitHub repo
3. Add PostgreSQL + Redis
4. Variables → Coller les secrets
5. Attendre le déploiement (2-3 min)
6. `curl $URL/api/health` → ✅

**Temps total:** 15 minutes

**Bon déploiement! 🚀**

---

## 🆘 Besoin d'aide?

Si vous rencontrez un problème:

1. **Logs Railway** (99% des erreurs visibles là)
2. **[DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)** (section Troubleshooting)
3. Railway Discord: https://discord.gg/railway
4. Medusa Discord: https://discord.gg/medusajs

---

*Guide créé le 6 janvier 2025*
