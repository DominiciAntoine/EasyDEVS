require('dotenv').config();
const { Pool } = require('pg'); // Import du client PostgreSQL

// Configuration de la connexion
const db = new Pool({
    host: process.env.DB_HOST,     // Hôte (défini dans .env)
    user: process.env.DB_USER,     // Utilisateur
    password: process.env.DB_PASSWORD, // Mot de passe
    database: process.env.DB_NAME, // Nom de la base de données
    port: process.env.DB_PORT || 5432, // Port par défaut de PostgreSQL
});


let tryConnect = 0
let success = false

function tryConnection() {
    db.connect(err => {
        if (err) {
            console.error('Erreur de connexion à la base de données:', err);
            tryConnect = tryConnect + 1
            if (tryConnect >= 3) {
                exit(1)
            } else {

                setTimeout(() =>
                    tryConnection()
                    , 3000)
            }
        } else {
            success = true
            console.log('Connecté à la base de données PostgreSQL');
        }
    });
}

tryConnection()



module.exports = db;