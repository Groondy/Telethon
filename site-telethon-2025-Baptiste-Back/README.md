# API de Gestion d'Utilisateurs et d'Équipes

Cette API, construite avec Node.js et Express, permet de gérer des utilisateurs, des équipes et des administrateurs. Elle inclut un système de points pour les utilisateurs et un classement par équipe.

## Fonctionnalités

- Gestion CRUD (Créer, Lire, Mettre à jour, Supprimer) des utilisateurs.
- Gestion des administrateurs avec authentification par mot de passe sécurisé (hachage bcrypt).
- Authentification basée sur les JSON Web Tokens (JWT) pour les routes protégées.
- Système de points pour les utilisateurs.
- Route pour obtenir le classement des équipes en fonction des points totaux.

## Technologies utilisées

- **Node.js** - Environnement d'exécution JavaScript.
- **Express.js** - Framework web pour Node.js.
- **SQLite** - Base de données SQL légère et basée sur un fichier.
- **jsonwebtoken** - Pour la création et la vérification des tokens d'authentification.
- **bcrypt** - Pour le hachage sécurisé des mots de passe.

## WebSockets

Le serveur expose un point d'accès WebSocket sur la même URL et le même port que l'API (par ex. `ws://localhost:3001`).

### Messages envoyés par le serveur

Le serveur envoie des notifications aux clients connectés lors de certains événements.

#### `POINTS_UPDATED`

- **Déclencheur :** Lorsqu'un administrateur modifie les points d'un utilisateur.
- **Payload :**
  ```json
  { "type": "POINTS_UPDATED", "payload": { "userId": "1", "points": 150 } }
  ```

## Documentation de l'API

### Authentification

La plupart des routes (celles concernant les utilisateurs) sont protégées. Pour y accéder, vous devez d'abord vous authentifier via la route `POST /api/admins/login`.

La réponse vous fournira un `accessToken`. Vous devrez ensuite inclure ce token dans l'en-tête `Authorization` de chaque requête protégée, au format `Bearer`.

**Exemple d'en-tête :**
`Authorization`: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

### Routes des Administrateurs (Publiques)

Ces routes permettent de gérer les comptes administrateurs et de s'authentifier.

#### `POST /api/admins/login`

- **Action :** Authentifie un administrateur et retourne un token JWT.
- **Authentification :** Non requise.
- **Corps de la requête :**
  ```json
  {
    "nom": "Admin",
    "prenom": "Super",
    "password": "unMotDePasseTresSecurise"
  }
  ```
- **Réponse (200 OK) :**
  ```json
  {
    "message": "Authentification réussie",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": 1,
      "nom": "Admin",
      "prenom": "Super"
    }
  }
  ```

#### `GET /api/admins`

- **Action :** Récupère la liste de tous les administrateurs (sans leur mot de passe).
- **Authentification :** Non requise.
- **Réponse (200 OK) :**
  ```json
  {
    "message": "Liste des administrateurs récupérée avec succès",
    "data": [{ "id": 1, "nom": "Admin", "prenom": "Super" }]
  }
  ```

---

#### `GET /api/utilisateurs` (Publique)

- **Action :** Récupère la liste de tous les utilisateurs.
- **Authentification :** Non requise.

#### `GET /api/utilisateurs/points/equipes` (Publique)

- **Action :** Récupère le score total de chaque équipe, trié par ordre décroissant.
- **Authentification :** Non requise.

#### `POST /api/utilisateurs` (Protégée)

- **Action :** Crée un nouvel utilisateur.
- **Authentification :** Requise (Token Bearer d'administrateur).
- **Corps de la requête :**
  ```json
  {
    "nom": "Dupont",
    "prenom": "Jean",
    "couleur_equipe": "Bleu",
    "points": 50
  }
  ```

#### `PUT /api/utilisateurs/:id` (Protégée)

- **Action :** Met à jour toutes les informations d'un utilisateur spécifique.
- **Corps de la requête :**
  ```json
  {
    "nom": "Durand",
    "prenom": "Marie",
    "couleur_equipe": "Rouge",
    "points": 100
  }
  ```

#### `PATCH /api/utilisateurs/:id/points` (Protégée)

- **Authentification :** Requise (Token Bearer d'administrateur).
  ```json
  {
    "points": 150
  }
  ```

#### `DELETE /api/utilisateurs/:id`(Protégée)

- **Action :** Supprime un utilisateur spécifique.
