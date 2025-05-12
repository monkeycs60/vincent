# Vincendrier

Un site fun et sans prise de tête qui affiche les dernières images de Vincent générées par l'IA dans des situations cocasses.

## Concept

Vincendrier est un site qui génère automatiquement des images de Vincent, un développeur senior, en utilisant l'IA. Chaque jour à midi, une nouvelle image est générée avec une punchline sarcastique typique de Vincent.

## Stack Technique

-  **Frontend**: Next.js 15, TailwindCSS, Shadcn UI, Framer Motion
-  **Backend**: Server Actions Next.js, Prisma
-  **IA**: Vercel AI SDK, Google AI (modèle Imagen)
-  **Storage**: Vercel Blob pour les images

## Configuration

### Prérequis

-  Node.js 18.14 ou supérieur
-  PostgreSQL
-  Compte Vercel (pour Vercel Blob)
-  API Key Google pour l'IA

### Étapes d'installation

1. **Cloner le repo**

```bash
git clone https://github.com/votre-utilisateur/vincendrier.git
cd vincendrier
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet avec les variables suivantes:

```
# Base de données
DATABASE_URL="postgresql://utilisateur:mot_de_passe@localhost:5432/vincent"

# Vercel Blob storage
BLOB_READ_WRITE_TOKEN="votre_token_vercel_blob"

# Vercel AI avec Google
GOOGLE_AI_API_KEY="votre_api_key_google"

# Clé API pour le seeding
SEED_API_KEY="une_clé_secrète_pour_le_seeding"
```

4. **Initialiser la base de données**

```bash
npx prisma db push
```

5. **Générer les images initiales**

```bash
curl -X GET http://localhost:3000/api/seed -H "x-api-key: votre_clé_seeding"
```

6. **Lancer le serveur de développement**

```bash
npm run dev
```

## Configuration pour la Production

### Configuration de Vercel

1. Créez un projet sur Vercel et connectez-le à votre repository
2. Configurez une base de données PostgreSQL (Vercel Postgres ou service externe)
3. Configurez Vercel Blob en suivant la documentation officielle
4. Ajoutez toutes les variables d'environnement dans les paramètres du projet Vercel

### Cron Job pour la génération quotidienne

Utilisez Vercel Cron pour appeler l'API de génération d'images chaque jour à midi:

1. Créez un fichier `vercel.json` à la racine du projet:

```json
{
	"crons": [
		{
			"path": "/api/cron",
			"schedule": "0 12 * * *"
		}
	]
}
```

2. Déployez sur Vercel qui exécutera automatiquement le cron job selon le planning défini.

## Licence

Ce projet est sous licence MIT.
