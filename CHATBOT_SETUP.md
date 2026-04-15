# Configuration ChatBot IA - AGS Concept

## 🚀 Étapes de Configuration

### 1. Obtenir les clés Gemini API (Google)

1. Va sur https://makersuite.google.com/app/apikey
2. Clique sur **"Create API key"**
3. Sélectionne **"Create API key in new Google Cloud project"** ou utilise un projet existant
4. Copie la clé API générée
5. Ajoute-la dans:
   - **Local**: `.env.local` → `GEMINI_API_KEY=ta_clé_ici`
   - **Vercel**: Dashboard → Settings → Environment Variables → `GEMINI_API_KEY`

> **Important**: Gemini API est gratuit avec un tier de 60 requêtes par minute

---

### 2. Configurer Firebase Firestore (Gratuit)

#### A. Créer un projet Firebase

1. Va sur https://console.firebase.google.com
2. Clique **"Add project"**
3. Nomme-le (ex: `agsconcept-chatbot`)
4. Accepte les conditions et clique **"Create project"**

#### B. Obtenir les clés de configuration

1. Dans le dashboard Firebase, clique sur **⚙️ Project Settings** (engrenage en haut)
2. Va à l'onglet **"Service Accounts"**
3. Clique **"Generate New Private Key"** → télécharge le JSON
4. Copie les valeurs suivantes:

```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "agsconcept-chatbot.firebaseapp.com",
  "projectId": "agsconcept-chatbot",
  "storageBucket": "agsconcept-chatbot.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcd..."
}
```

#### C. Ajouter les clés

- **Local**: Dans `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: 'ta_clé_ici',
    authDomain: 'ton_auth_domain',
    projectId: 'ton_project_id',
    // ... autres valeurs
  }
};
```

- **Production**: Même configuration dans `src/environments/environment.prod.ts`

#### D. Créer la base Firestore

1. Dans Firebase Console, va à **Firestore Database**
2. Clique **"Create database"**
3. Mode: **Start in test mode** (pour dev)
4. Location: **europe-west1** (ou ta région préférée)
5. Clique **"Create"**

> La collection `conversations` sera créée automatiquement à la première requête du chatbot

---

### 3. Déployer sur Vercel

#### A. Variables d'environnement Vercel

1. Va sur https://vercel.com/dashboard
2. Sélectionne ton projet **AGS Concept**
3. **Settings** → **Environment Variables**
4. Ajoute:
   - `GEMINI_API_KEY` = ta clé Gemini
   - Optionnel: Variables Firebase si tu veux les stocker là aussi

#### B. Redéploie

```bash
git add .
git commit -m "Ajouter chatbot IA avec Gemini + Firebase"
git push origin main
```

Vercel redéploiera automatiquement.

---

## 🧪 Test Local

```bash
# 1. Assure-toi que .env.local existe avec les bonnes clés
# 2. Démarre le serveur dev
npm start

# 3. Ouvre http://localhost:4200
# 4. Clique sur le bouton flottant en bas à droite
# 5. Pose une question
```

---

## 📊 Coûts Estimés

- **Gemini API**: Gratuit (60 req/min)
- **Firebase Firestore**: Gratuit (125K lectures/jour)
- **Vercel**: Gratuit (serverless functions incluses)

**Total: 0€ / mois**

---

## ⚠️ Points Importants

1. **Ne committe JAMAIS les vraies clés API** dans le code
2. Utilise toujours les variables d'environnement
3. Pour la prod, configure les variables dans Vercel dashboard
4. Le chatbot est **complètement ouvert** - il peut répondre à n'importe quelle question
5. Les conversations sont sauvegardées dans Firestore pour améliorer tes réponses futures

---

## 🐛 Troubleshooting

### Le chatbot ne répond pas
- Vérifie que `GEMINI_API_KEY` est définie dans Vercel
- Vérifie les logs Vercel: Deployments → Fonction → Logs

### Firebase ne fonctionne pas
- Assure-toi que Firestore Database est **créé** (pas juste le projet)
- Vérifie que les clés Firebase sont correctes dans `src/environments/environment.ts`
- Vérifie les règles Firestore (en test mode, elles sont ouvertes)

### Le widget n'apparaît pas
- Ouvre la console du navigateur (F12)
- Cherche les erreurs JavaScript
- Assure-toi que le composant ChatBot est bien importé dans app.component.ts

---

## 📝 Résumé Rapide

1. ✅ Clé Gemini → `.env.local` + Vercel env vars
2. ✅ Projet Firebase + Firestore
3. ✅ Clés Firebase → `src/environments/environment.ts`
4. ✅ Push et redéploiement auto sur Vercel

C'est tout! 🎉