require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env
const express = require('express'); // Import du framework Express.js
const authenticateToken = require('../middlewares/auth'); // Middleware d'authentification JWT
const OpenAI = require("openai");

const router = express.Router();


// Route pour générer un diagramme
router.post('/generate-diagram', authenticateToken, async (req, res) => {
  const { diagramName, userPrompt } = req.body;

  // Validation des champs `diagramName` et `userPrompt`
  if (!diagramName || typeof diagramName !== 'string' || diagramName.trim() === '') {
    return res.status(400).json({ error: "Le champ 'diagramName' est requis et doit être une chaîne de caractères non vide." });
  }
  if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim() === '') {
    return res.status(400).json({ error: "Le champ 'userPrompt' est requis et doit être une chaîne de caractères non vide." });
  }

  res.json(
    "a mettre"
  );
});

// Route pour définir le comportement d'un composant du modèle
router.post('/generate-model', authenticateToken, async (req, res) => {
  const { modelName, modelType, previousModelsCode, userPrompt } = req.body;

  // Validation des champs
  if (!modelName || typeof modelName !== 'string' || modelName.trim() === '') {
    return res.status(400).json({ error: "Le champ 'modelName' est requis et doit être une chaîne de caractères non vide." });
  }
  if (!modelType || typeof modelType !== 'string' || modelType.trim() === '') {
    return res.status(400).json({ error: "Le champ 'modelType' est requis et doit être une chaîne de caractères non vide." });
  }
  if (!previousModelsCode || typeof previousModelsCode !== 'string') {
    return res.status(400).json({ error: "Le champ 'previousModelsCode' est requis et doit être une chaîne de caractères." });
  }
  if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim() === '') {
    return res.status(400).json({ error: "Le champ 'userPrompt' est requis et doit être une chaîne de caractères non vide." });
  }

  res.json(
    "a mettre"
  );
});

module.exports = router;
