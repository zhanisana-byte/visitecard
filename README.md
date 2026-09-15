# visiteCard — page d'accueil

Projet Next.js responsive prêt à déployer sur Vercel.

## Démarrage

```bash
npm install
npm run dev
```

## Pages

- `/` : page d'accueil responsive
- `/connexion` : interface de connexion
- `/creer-compte` : interface de création de compte

La page d'accueil garde uniquement **Connexion** et **Créer un compte** dans l'en-tête. Le bouton hero « Créer ma carte » a été supprimé.

Le bloc « Mon QR Code » en bas renvoie actuellement vers la connexion. Il pourra ensuite être connecté au vrai QR code du compte utilisateur et à Supabase.
