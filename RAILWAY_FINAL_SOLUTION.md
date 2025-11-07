# 🎯 Railway - Solution Finale du Déploiement

## 📊 Diagnostic du Problème

**Erreur** : L'application crash instantanément sans logs

**Cause** : La base de données PostgreSQL **n'a pas encore de tables**. Les migrations Medusa n'ont jamais été exécutées.

**Résultat** : Medusa démarre → essaie de se connecter à la DB → ne trouve pas les tables → crash

---

## ✅ LA SOLUTION (5 Minutes)

### Étape 1 : Exécuter les Migrations Manuellement

**Dans votre terminal local** :

```bash
# 1. Se connecter à Railway
export RAILWAY_TOKEN="7638cd05-3f0c-44e2-ba28-0bc68705cc47"

# 2. Naviguer dans le projet
cd /Users/auriolbenjamin/medusa-starter-default

# 3. Exécuter les migrations sur Railway
railway run --service 73d0dc17-dd17-472d-97ac-fe8c9dc784da yarn medusa db:migrate
```

**Attendez que les migrations se terminent** (1-2 minutes).

**Vous devriez voir** :
```
✅ Migrations executed successfully
```

---

### Étape 2 : Redémarrer le Service

**Option A - Via Railway Dashboard** (Recommandé) :
1. Allez sur https://railway.app/project/6ab4109d-6dea-4db8-ba35-38726835b5a1/service/73d0dc17-dd17-472d-97ac-fe8c9dc784da
2. Cliquez sur **"Restart"** (bouton en haut à droite)

**Option B - Via CLI** :
```bash
railway restart --service 73d0dc17-dd17-472d-97ac-fe8c9dc784da
```

---

### Étape 3 : Vérifier que ça Fonctionne

**Attendez 30-60 secondes**, puis testez :

```bash
curl https://medusa-production-58da.up.railway.app/api/health
```

**Réponse attendue** :
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  }
}
```

---

## 🔧 Si les Migrations Échouent

### Erreur : "Cannot find module"

**Solution** : Le service doit être déployé au moins une fois pour que les fichiers existent.

```bash
# 1. Forcer un déploiement
railway up --service 73d0dc17-dd17-472d-97ac-fe8c9dc784da --detach

# 2. Attendre que le build termine (3-4 min)

# 3. Puis exécuter les migrations
railway run --service 73d0dc17-dd17-472d-97ac-fe8c9dc784da yarn medusa db:migrate
```

### Erreur : "DATABASE_URL is not defined"

**Solution** : Vérifier que la variable est bien configurée

```bash
railway variables --service 73d0dc17-dd17-472d-97ac-fe8c9dc784da | grep DATABASE_URL
```

Si vide, l'ajouter :
```bash
railway variables set DATABASE_URL='${{Postgres.DATABASE_URL}}' --service 73d0dc17-dd17-472d-97ac-fe8c9dc784da
```

---

## 🧪 Tests Complets Après Déploiement

```bash
URL="https://medusa-production-58da.up.railway.app"

# 1. Health Check
curl "$URL/api/health"

# 2. Pricing API
curl "$URL/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5&quantity=100"

# 3. Pricing Matrix
curl "$URL/api/pricing?support=vinyle-blanc&forme=rond&taille=5x5"

# 4. SEO Structure
curl "$URL/api/seo/structure"

# 5. SEO Report
curl "$URL/api/seo/report"
```

---

## 🌱 Seed des Données

**Une fois que le service fonctionne** :

```bash
railway run --service 73d0dc17-dd17-472d-97ac-fe8c9dc784da yarn seed:stickers
```

Cela va créer :
- 5 catégories de stickers
- 1 produit "Stickers Personnalisés"
- 3 options (support, forme, taille)
- Tous les choix possibles

---

## 📋 Checklist Finale

- [ ] Migrations exécutées avec succès
- [ ] Service redémarré
- [ ] `/api/health` retourne `{"status":"healthy"}`
- [ ] `/api/pricing` fonctionne
- [ ] `/api/seo/structure` fonctionne
- [ ] Seed des données exécuté
- [ ] Tous les endpoints testés

---

## 🎯 Pourquoi Cette Solution

**Avant** :
- `railway.json` : `startCommand: "yarn medusa db:migrate && yarn start"`
- Problème : Les migrations échouent au startup → crash

**Maintenant** :
- `railway.json` : `startCommand: "yarn start"` (simplifié)
- Migrations exécutées **manuellement d'abord**
- Puis le service démarre proprement

**Une fois déployé** : Les migrations sont déjà faites, le service démarre instantanément.

---

## 💡 Pour les Prochains Déploiements

**Option 1 - Automatique** (Recommandé) :

Remettre les migrations dans railway.json **une fois que la DB est initialisée** :

```json
{
  "deploy": {
    "startCommand": "yarn medusa db:migrate && yarn start"
  }
}
```

Les prochaines migrations (ajout de colonnes, etc.) se feront automatiquement au redémarrage.

**Option 2 - Manuel** :

Garder le `startCommand` simple et exécuter manuellement les nouvelles migrations quand nécessaire.

---

## 🆘 Support

**Si ça ne fonctionne toujours pas** :

1. Copiez les logs de la commande `railway run yarn medusa db:migrate`
2. Vérifiez que PostgreSQL est bien connecté : `railway variables | grep DATABASE_URL`
3. Vérifiez que le build a réussi dans Railway Dashboard

---

**URL du Projet Railway** : https://railway.app/project/6ab4109d-6dea-4db8-ba35-38726835b5a1

**URL du Service Medusa** : https://railway.app/project/6ab4109d-6dea-4db8-ba35-38726835b5a1/service/73d0dc17-dd17-472d-97ac-fe8c9dc784da

**URL de Production** : https://medusa-production-58da.up.railway.app

---

*Solution finale - 6 Janvier 2025*
