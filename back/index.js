require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour gérer les requêtes JSON
app.use(express.json());
// Middleware cookie-parser
app.use(cookieParser());
// Configuration de CORS
app.use(cors({
    origin: process.env.CLIENT_URL, // Front-end autorisé
    credentials: true, // Permet l'envoi des cookies
}));

// Inclure les routes après le middleware JSON
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const dataRoutes = require('./routes/data');
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/data', dataRoutes);

// Connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connecté à la base de données MySQL');
    }
});

// Lancement du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
});
