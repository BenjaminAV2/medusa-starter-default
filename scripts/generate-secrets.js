#!/usr/bin/env node

/**
 * Script pour générer tous les secrets nécessaires au déploiement
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto')

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex')
}

console.log('\n🔐 Génération des secrets pour le déploiement...\n')
console.log('=' .repeat(70))
console.log('\n📋 VARIABLES D\'ENVIRONNEMENT À CONFIGURER\n')
console.log('=' .repeat(70))

console.log('\n### SÉCURITÉ (OBLIGATOIRE) ###\n')
console.log(`JWT_SECRET=${generateSecret(64)}`)
console.log(`COOKIE_SECRET=${generateSecret(64)}`)

console.log('\n### CORS (À ADAPTER) ###\n')
console.log('STORE_CORS=https://votre-frontend.com')
console.log('ADMIN_CORS=https://admin.votre-domaine.com')
console.log('AUTH_CORS=https://admin.votre-domaine.com')

console.log('\n### BASE DE DONNÉES (Automatique sur Railway) ###\n')
console.log('DATABASE_URL=<fourni-par-railway>')
console.log('REDIS_URL=<fourni-par-railway>')

console.log('\n### CLOUDFLARE R2 (Phase 2 - Optionnel) ###\n')
console.log('R2_ACCOUNT_ID=your_account_id')
console.log('R2_ACCESS_KEY_ID=your_access_key')
console.log('R2_SECRET_ACCESS_KEY=your_secret_key')
console.log('R2_BUCKET=client-uploads')
console.log('R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com')
console.log('R2_PUBLIC_URL=https://cdn.votre-domaine.com')

console.log('\n### STRIPE (Phase 3) ###\n')
console.log('STRIPE_SECRET_KEY=sk_live_...')
console.log('STRIPE_PUBLISHABLE_KEY=pk_live_...')
console.log('STRIPE_WEBHOOK_SECRET=whsec_...')

console.log('\n### PAYPAL (Phase 3) ###\n')
console.log('PAYPAL_CLIENT_ID=...')
console.log('PAYPAL_CLIENT_SECRET=...')
console.log('PAYPAL_MODE=live')

console.log('\n### EMAILS (Phase 3) ###\n')
console.log('RESEND_API_KEY=re_...')
console.log('EMAIL_FROM=noreply@votre-domaine.com')

console.log('\n### RATE LIMITING (Optionnel) ###\n')
console.log('RATE_LIMIT_WINDOW_MS=60000')
console.log('RATE_LIMIT_MAX_REQUESTS=100')

console.log('\n### URLS (À ADAPTER) ###\n')
console.log('APP_URL=https://api.votre-domaine.com')
console.log('FRONTEND_URL=https://votre-frontend.com')

console.log('\n' + '='.repeat(70))
console.log('\n✅ Secrets générés avec succès!')
console.log('\n💡 Pour Railway:')
console.log('   1. Copier les variables ci-dessus')
console.log('   2. Railway Dashboard → Variables')
console.log('   3. Coller et adapter les valeurs')
console.log('\n💡 Pour fichier .env local:')
console.log('   1. Copier dans .env')
console.log('   2. Remplacer les valeurs par vos vraies credentials')
console.log('\n📖 Guide complet: DEPLOY_RAILWAY.md\n')
