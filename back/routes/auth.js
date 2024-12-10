require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const authenticate = require('../middlewares/auth'); // Middleware d'authentification JWT
const isProduction = process.env.NODE_ENV === 'production';

const router = express.Router();

// Connexion
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = $1';
    db.query(sql, [email], async (err, results) => {
        if (err || results.rows.length === 0) {
            return res.status(401).send({ message: 'Utilisateur non trouvé' });
        }

        const user = results.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send({ message: 'Mot de passe incorrect' });
        }

        // Générer les tokens
        const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
        // Envoyer le refreshToken dans un cookie sécurisé
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction, // Nécessaire en production pour HTTPS
            sameSite: isProduction ? 'none' : 'lax', // Utiliser 'lax' en développement local
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        });

        // Répondre avec l'accessToken
        res.status(200).send({ message: 'Connexion réussie', accessToken });

    });
});

// Inscription
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Vérification des champs obligatoires
    if (!email || !password) {
        return res.status(400).send({ message: 'Email et mot de passe sont requis' });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const sqlCheck = 'SELECT * FROM users WHERE email = $1';
        db.query(sqlCheck, [email], async (err, results) => {
            if (err) {
                console.log(err);
                return res.status(500).send({ message: 'Erreur lors de la vérification de l\'utilisateur' });
            }

            if (results.rows.length > 0) {
                return res.status(409).send({ message: 'Cet utilisateur existe déjà' });
            }

            // Hacher le mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insérer l'utilisateur dans la base de données
            const sqlInsert = 'INSERT INTO users (email, password) VALUES ($1, $2)';
            db.query(sqlInsert, [email, hashedPassword], (err) => {
                if (err) {
                    return res.status(500).send({ message: 'Erreur lors de l\'enregistrement de l\'utilisateur' });
                }

                res.status(201).send({ message: 'Utilisateur créé avec succès' });
            });
        });
    } catch (error) {
        res.status(500).send({ message: 'Erreur du serveur', error });
    }
});

// Récupération des informations utilisateur
router.get('/me', authenticate, (req, res) => {


    const sql = 'SELECT id, email FROM users WHERE id = $1';
    db.query(sql, [req.user.id], (err, results) => {
        if (err || results.rows.length === 0) {
            return res.status(404).send({ message: 'Utilisateur non trouvé' });
        }

        const user = results.rows[0];
        res.status(200).send(user);
    });
});

router.post('/refresh-token', (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).send({ message: "Refresh token required" });
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err || !decoded.id) {
                return res.status(403).send({ message: "Invalid refresh token" });
            }

            const sql = 'SELECT id, email FROM users WHERE id = $1';
            db.query(sql, [decoded.id], (err, results) => {
                if (err || results.rows.length === 0) {
                    return res.status(404).send({ message: "User not found" });
                }

                // Générer un nouveau token d'accès
                const accessToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

                // Générer un nouveau refresh token
                const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

                // Envoyer le nouveau refreshToken dans un cookie
                res.cookie('refreshToken', newRefreshToken, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: isProduction ? 'none' : 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });

                return res.status(200).send({ accessToken });
            });
        });
    } catch (error) {
        console.error("Erreur lors du rafraîchissement du token :", error);
        res.status(500).send({ message: "Server error", error });
    }
});


// Déconnexion
router.post('/logout', authenticate, (req, res) => {
    const sqlDelete = 'DELETE FROM refresh_tokens WHERE user_id = $1';
    db.query(sqlDelete, [req.user.id], (err) => {
        if (err) {
            return res.status(500).send({ message: 'Erreur lors de la déconnexion' });
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'none' : 'lax',
        });

        res.status(200).send({ message: 'Déconnexion réussie' });
    });
});

module.exports = router;
