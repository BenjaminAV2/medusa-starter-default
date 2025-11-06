# 🔍 Railway Troubleshooting - Déploiements Échoués

## 📊 Situation Actuelle

**Projet**: ENV-STICKER
**Service**: medusa-api (ID: `a5d4fcfe-5cfc-48d2-b8a6-4fdac6ac1426`)
**Problème**: Tous les déploiements échouent systématiquement

### Déploiements Récents (Tous FAILED):
- `54adb5af-6824-4f78-b1bd-bc00cee9cfcc` - 18:33 (depuis GitHub)
- `affc44e6-3ff9-4c71-8ace-d48f60172efa` - 18:31
- `fefac371-d8d0-4a5d-8b98-c68aa2d644be` - 18:29

---

## 🎯 ACTIONS IMMÉDIATES À FAIRE

### 1. Voir les Logs d'Erreur (PRIORITÉ #1)

**URL directe**: https://railway.app/project/6ab4109d-6dea-4db8-ba35-38726835b5a1/service/a5d4fcfe-5cfc-48d2-b8a6-4fdac6ac1426

**Instructions**:
1. Cliquez sur l'onglet **"Deployments"**
2. Cliquez sur le dernier déploiement FAILED (en haut)
3. Cliquez sur **"View Logs"**
4. **Copiez les dernières lignes d'erreur** (surtout celles en rouge)

**Ce que je cherche dans les logs**:
```bash
# Erreurs de build possibles:
- "error Command failed"
- "ENOENT: no such file or directory"
- "Cannot find module"
- "Database connection failed"

# Erreurs de start possibles:
- "Port 9000 is already in use"
- "DATABASE_URL is not defined"
- "REDIS_URL is not defined"
```

---

### 2. Vérifier les Variables d'Environnement

**Dans le service medusa-api → Onglet "Variables"**

**Variables OBLIGATOIRES à vérifier**:

```bash
✅ DATABASE_URL = ${{Postgres.DATABASE_URL}}
✅ REDIS_URL = ${{Redis.REDIS_URL}}
✅ JWT_SECRET = 155d7731f1ef94f1957bdf4d5a151f2cb58a17e4c199eb1ec41a86de6a56cedc5948b161f34fe9a26fb5c46703010f24aed588023953bf422a43c6b31b10b379
✅ COOKIE_SECRET = b9b6a237c41376e50f35dfe0a71f09fc53899bda6b03c77a65684fe6ac081a33a16d1330fed9802c7243a7b8e5674b66d2bfd47560d511892f5bb6f7d9dea3a8
✅ STORE_CORS = http://localhost:3000,http://localhost:8000
✅ ADMIN_CORS = http://localhost:9000,http://localhost:7001
✅ AUTH_CORS = http://localhost:9000,http://localhost:7001
✅ PORT = 9000
```

**Variables POTENTIELLEMENT PROBLÉMATIQUES** (à SUPPRIMER si présentes):
```bash
❌ NIXPACKS_BUILD_CMD (peut conflicter avec railway.json)
❌ NIXPACKS_START_CMD (peut conflicter avec railway.json)
❌ RAILWAY_DOCKERFILE_PATH (on n'utilise pas Docker ici)
```

**Comment supprimer une variable**:
1. Survolez la variable
2. Cliquez sur l'icône poubelle (🗑️) à droite
3. Confirmez

---

### 3. Vérifier la Source GitHub

**Dans le service medusa-api → Onglet "Settings" → Section "Source"**

**Ce qui DOIT être configuré**:
```
Repository: BenjaminAV2/medusa-starter-default
Branch: main
```

**Si la source n'est PAS configurée**:
1. Cliquez **"Connect Repo"**
2. Sélectionnez `BenjaminAV2/medusa-starter-default`
3. Branch: `main`
4. Railway déclenchera un nouveau déploiement automatiquement

---

## 🔧 Solutions Selon l'Erreur

### Erreur: "Command not found: yarn"

**Solution**:
- Railway n'a pas détecté le projet comme Node.js
- Vérifier que `package.json` est bien à la racine du repo
- Vérifier que `railway.json` existe et est valide

### Erreur: "DATABASE_URL is not defined"

**Solution 1**: Ajouter la variable
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

**Solution 2**: Si Postgres n'est pas listé dans les références
1. Aller dans le projet ENV-STICKER
2. Vérifier que le service "Postgres" existe
3. Si oui, note son nom exact (peut être "PostgreSQL" ou autre)
4. Utiliser: `${{PostgreSQL.DATABASE_URL}}` ou le nom exact

### Erreur: "Port 9000 is already in use"

**Solution**: Supprimer la variable `PORT` et laisser Railway l'assigner automatiquement

### Erreur: "ENOENT: no such file or directory, open '.medusa/server/...'"

**Solution**: Le build n'a pas réussi
1. Vérifier les logs de build (pas les logs de start)
2. Chercher l'erreur dans la phase `yarn build`

### Erreur: "yarn install failed"

**Solution**:
1. Vérifier que `yarn.lock` est dans le repo
2. Vérifier qu'il n'y a pas de conflits de dépendances
3. Essayer de supprimer `NIXPACKS_BUILD_CMD` si présent

---

## 🆘 Si RIEN ne Fonctionne: Créer un Nouveau Service Propre

### Option: Recommencer avec un Service Neuf

**Étapes**:

1. **Dans le projet ENV-STICKER** → Cliquez **"+ New"**

2. **Sélectionnez "GitHub Repo"**
   - Repository: `BenjaminAV2/medusa-starter-default`
   - Branch: `main`
   - Railway détecte automatiquement `railway.json` ✅

3. **Attendez que le service soit créé** (30 sec)

4. **Configurez UNIQUEMENT ces variables** (onglet Variables):

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=155d7731f1ef94f1957bdf4d5a151f2cb58a17e4c199eb1ec41a86de6a56cedc5948b161f34fe9a26fb5c46703010f24aed588023953bf422a43c6b31b10b379
COOKIE_SECRET=b9b6a237c41376e50f35dfe0a71f09fc53899bda6b03c77a65684fe6ac081a33a16d1330fed9802c7243a7b8e5674b66d2bfd47560d511892f5bb6f7d9dea3a8
STORE_CORS=http://localhost:3000,http://localhost:8000
ADMIN_CORS=http://localhost:9000,http://localhost:7001
AUTH_CORS=http://localhost:9000,http://localhost:7001
```

5. **Ne touchez à RIEN d'autre** - Laissez Railway utiliser `railway.json`

6. **Railway va automatiquement**:
   - Détecter Node.js 20 (via `package.json`)
   - Utiliser les commandes de `railway.json`:
     - Build: `yarn install --immutable && yarn build`
     - Start: `yarn medusa db:migrate && yarn run start`

---

## 📋 Checklist de Diagnostic

Cochez au fur et à mesure:

### Configuration Basique
- [ ] Le service `medusa-api` existe dans ENV-STICKER
- [ ] GitHub repo est connecté (`BenjaminAV2/medusa-starter-default`, branch `main`)
- [ ] Les services Postgres et Redis existent dans le projet
- [ ] J'ai vu les logs du dernier déploiement échoué

### Variables d'Environnement
- [ ] `DATABASE_URL` est défini avec `${{Postgres.DATABASE_URL}}`
- [ ] `REDIS_URL` est défini avec `${{Redis.REDIS_URL}}`
- [ ] `JWT_SECRET` est défini (128 caractères)
- [ ] `COOKIE_SECRET` est défini (128 caractères)
- [ ] CORS variables sont définies
- [ ] ❌ AUCUNE variable `NIXPACKS_*` n'est présente
- [ ] ❌ AUCUNE variable `RAILWAY_DOCKERFILE_PATH` n'est présente

### Fichiers dans le Repo
- [ ] `package.json` existe à la racine
- [ ] `railway.json` existe à la racine
- [ ] `yarn.lock` existe à la racine
- [ ] Le dossier `.medusa/` est dans `.gitignore`

---

## 🎯 Prochaines Étapes Après Diagnostic

### Une fois que vous avez les logs d'erreur:

**Envoyez-moi**:
1. Les dernières 20 lignes des logs d'erreur
2. La liste complète des variables configurées (screenshot ou copier-coller)
3. Confirmation que le repo GitHub est bien connecté

**Je pourrai alors**:
- Identifier exactement le problème
- Vous donner la solution précise
- Ou créer un script de fix automatique

---

## 💡 Conseil

**Si vous voyez 10+ déploiements FAILED**: Il vaut mieux **supprimer le service `medusa-api`** et **créer un nouveau service** en suivant la section "Créer un Nouveau Service Propre" ci-dessus.

Cela évitera d'accumuler des variables conflictuelles et repartira sur une base saine.

---

## 📞 Pour Continuer

Une fois que vous avez:
1. ✅ Les logs d'erreur
2. ✅ La liste des variables
3. ✅ Confirmation du repo connecté

Revenez vers moi avec ces infos et je débloquerai la situation immédiatement ! 🚀

---

*Document créé le 6 janvier 2025 - 18:40*
