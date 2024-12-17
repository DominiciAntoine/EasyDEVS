require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env
const express = require('express'); // Import du framework Express.js
const authenticateToken = require('../middlewares/auth'); // Middleware d'authentification JWT
const OpenAI = require("openai");

const router = express.Router();
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const { systemDiagramPrompt } = require("../prompt/diagram_prompt");

const NodeSchema = z.object({
  id: z.string(),
  type: z.literal("resizer"),
  data: z.object({
    modelType: z.enum(["atomic", "coupled"]),
    label: z.string(),
    inputPorts: z.array(
      z.object({
        id: z.string(),
      })
    ),
    outputPorts: z.array(
      z.object({
        id: z.string(),
      })
    ),
  }),
  style: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  parentId: z.string().optional(),
  extent: z.literal("parent").optional(),
});


const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  sourceHandle: z.string(),
  target: z.string(),
  targetHandle: z.string(),
  type: z.string(),
});

const DEVSDiagramSchema = z.object({
  nodes: z.array(NodeSchema),
  edges: z.array(EdgeSchema),
});

// Configure OpenAI pour utiliser vLLM ou l'API OpenAI
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY, // Clé API fictive, remplace par une clé valide si nécessaire
  baseURL: process.env.AI_API_URL, // URL du serveur vLLM ou OpenAI
});



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

  try {
    const completion = await openai.beta.chat.completions.parse({
      model: 'llama-3.1-70b-instruct',
      messages: [{ role: 'system', content: systemDiagramPrompt.trim() },
      { role: 'user', content: userPrompt },

      ],
      response_format: zodResponseFormat(DEVSDiagramSchema, "DEVSDiagramSchema"),
    });

    const rawContent = completion.choices[0].message.parsed;
    res.json(rawContent);
  } catch (error) {
    console.error('Erreur lors de l’appel à vLLM :', error);
    res.status(500).json({
      error: 'Erreur lors de la génération du diagramme avec l’IA.',
    });
  }

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

  const fullPrompt = `
You are an expert in DEVS modeling. Define the behavior of a specific model in a DEVS diagram based on the user's description.

Model Name: ${modelName}
Model Type: ${modelType}

Previous Models Code:
${previousModelsCode.trim()}

User Description: ${userPrompt.trim()}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'qwen2.5-coder',
      messages: [{ role: 'user', content: fullPrompt }],
    });

    // Renvoyer la réponse complète au client
    res.json(completion.choices[0].message);
  } catch (error) {
    console.error('Erreur lors de l’appel à vLLM :', error);
    res.status(500).json({ error: "Erreur lors de l'appel au modèle AI." });
  }
});

module.exports = router;
