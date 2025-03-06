# EasyDEVS API

Une API REST construite avec **Express.js** et **MySQL** avec les fonctionnalités suivantes :
- CORS
- Authentification par token JWT
- Hachage des mots de passe
- Base de données MySQL

## Prérequis

Avant de lancer le projet, assurez-vous d'avoir installé les éléments suivants :
- [Node.js](https://nodejs.org/) (version 14 ou plus)
- [MySQL](https://www.mysql.com/)

## Installation

1. **Cloner le dépôt** :

   ```bash
   git clone https://github.com/votre-utilisateur/easydevs-api.git
   cd easydevs-api
   ```

2. **Installer les dépendances** :

   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement** :

   Créez un fichier `.env` à la racine du projet avec le contenu suivant :

   ```plaintext
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=EASYDEVS
   JWT_SECRET=your_jwt_secret
   ```

   Remplacez `your_password` par le mot de passe de votre base de données MySQL et `your_jwt_secret` par une clé secrète pour le token JWT.

4. **Configurer la base de données MySQL** :

   Connectez-vous à MySQL et exécutez les commandes suivantes pour créer la base de données et la table utilisateur :

   ```sql
   CREATE DATABASE EASYDEVS;

   USE EASYDEVS;

   CREATE TABLE users (
       id INT PRIMARY KEY AUTO_INCREMENT,
       username VARCHAR(255) UNIQUE NOT NULL,
       password VARCHAR(255) NOT NULL
   );
   ```

## Démarrer le serveur

Pour démarrer le serveur, utilisez la commande suivante :

```bash
npm start
```

Si vous avez installé **nodemon**, vous pouvez aussi exécuter :

```bash
nodemon
```

Le serveur devrait démarrer sur le port défini dans le fichier `.env` (par défaut, `3000`). Vous verrez un message confirmant la connexion à la base de données MySQL.

## Utilisation de l'API

### Endpoints disponibles

- **POST /api/auth/register** : Inscription d'un utilisateur
   - Corps de la requête (JSON) :
     ```
     {
       "username": "votreNom",
       "password": "votreMotDePasse"
     }
     ```

- **POST /api/auth/login** : Connexion de l'utilisateur
   - Corps de la requête (JSON) :
     ```
     {
       "username": "votreNom",
       "password": "votreMotDePasse"
     }
     ```
   - Réponse :
     ```
     {
       "message": "Connexion réussie",
       "token": "jwt_token"
     }
     ```

- **GET /api/auth/profile** : Obtenir le profil de l'utilisateur connecté (protégé par JWT)
   - Headers :
     - Authorization: Bearer `jwt_token`
   
### Exemple de requêtes avec Postman

1. **Inscription d'un utilisateur** :
   - URL : `http://localhost:3000/api/auth/register`
   - Méthode : `POST`
   - Corps (JSON) :
     ```
     {
       "username": "nouvelUtilisateur",
       "password": "motDePasse"
     }
     ```

2. **Connexion de l'utilisateur** :
   - URL : `http://localhost:3000/api/auth/login`
   - Méthode : `POST`
   - Corps (JSON) :
     ```
     {
       "username": "nouvelUtilisateur",
       "password": "motDePasse"
     }
     ```
   - Réponse : Le token JWT sera fourni dans la réponse pour les requêtes futures.

3. **Accéder au profil de l'utilisateur** :
   - URL : `http://localhost:3000/api/auth/profile`
   - Méthode : `GET`
   - Headers :
     - Authorization: Bearer `jwt_token` (remplacez `jwt_token` par le token reçu lors de la connexion)

## Dépannage

- **Erreur de connexion à la base de données** : Assurez-vous que vos informations MySQL dans le fichier `.env` sont correctes.
- **Erreur `req.body is undefined`** : Vérifiez que `app.use(express.json())` est bien placé avant les routes dans `index.js`.

## License

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser, le modifier et le distribuer.
