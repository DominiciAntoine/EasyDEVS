require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env
const express = require('express'); // Import du framework Express.js
const authenticateToken = require('../middlewares/auth'); // Middleware d'authentification JWT
const OpenAI = require("openai");
const { diagramExample } = require("../prompt/diagramExample");
const router = express.Router();
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const { systemDiagramPrompt } = require("../prompt/diagram_prompt");

const PortSchema = z.object({
  in: z.array(z.string()).optional(),
  out: z.array(z.string()).optional(),
});

const ModelSchema = z.object({
  id: z.string(),
  type: z.enum(["atomic", "coupled"]),
  ports: PortSchema.optional(),  // Les ports sont optionnels
  components: z.array(z.string()).optional(),  // Les composants aussi
});

const ConnectionSchema = z.object({
  from: z.object({
    model: z.string(),
    port: z.string(),
  }),
  to: z.object({
    model: z.string(),
    port: z.string(),
  }),
});

const DevsSchema = z.object({
  models: z.array(ModelSchema),
  connections: z.array(ConnectionSchema),
});

// Configure OpenAI pour utiliser vLLM ou l'API OpenAI
const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY, // Clé API fictive, remplace par une clé valide si nécessaire
  baseURL: process.env.AI_API_URL, // URL du serveur vLLM ou OpenAI
});

function findParent(nodeid, diagram) {
  for (const model of diagram.models) {
      if (model.type === "coupled" && model.components.includes(nodeid)) {
          return model.id;
      }
  }
  return null;
}

function splitConnection(conn, diagram) {
    let connections = [];
    let intermediate = conn.from.model;

    // Vérifier si le modèle source a un parent et créer des connexions intermédiaires
    while (findParent(intermediate, diagram)) {
        let parent = findParent(intermediate, diagram);
        connections.push({ from: { model: intermediate, port: conn.from.port }, to: { model: parent, port: "" } });
        intermediate = parent;
    }

    let finalSource = intermediate;
    intermediate = conn.to.model;

    // Vérifier si le modèle destination a un parent et créer des connexions intermédiaires
    while (findParent(intermediate, diagram)) {
        let parent = findParent(intermediate, diagram);
        connections.push({ from: { model: parent, port: "" }, to: { model: intermediate, port: conn.to.port } });
        intermediate = parent;
    }

    let finalTarget = intermediate;

    // Ajouter la connexion finale entre les extrémités si elles sont différentes
    if (finalSource !== finalTarget) {
        connections.push({ from: { model: finalSource, port: conn.from.port }, to: { model: finalTarget, port: conn.to.port } });
    }
    
    return connections;
}

function convertDevsToReactFlow(diagram) {
    const nodes = [];
    const edges = [];
    const modelIdMap = {};
    let nodeId = 1;

    // Convertir les modèles en nœuds React Flow
    diagram.models.forEach(model => {
        const node = {
            id: nodeId.toString(),
            type: 'resizer',
            data: {
                modelType: model.type,
                label: model.id,
                inputPorts: [],
                outputPorts: [],
            },
            style: { width: 200, height: 200 },
            position: { x: 0, y: 0 },
        };

        modelIdMap[model.id] = nodeId.toString();

        if (model.ports) {
            if (model.ports.in) {
                node.data.inputPorts = model.ports.in.map((_, index) => ({ id: (index + 1).toString() }));
            }
            if (model.ports.out) {
                node.data.outputPorts = model.ports.out.map((_, index) => ({ id: (index + 1).toString() }));
            }
        }

        nodes.push(node);
        nodeId++;
    });

    // Ajouter les modèles couplés et leurs composants internes
    diagram.models.forEach(model => {
        if (model.type === "coupled") {
            const parentId = modelIdMap[model.id];
            model.components.forEach(componentId => {
                if (modelIdMap[componentId]) {
                    const childNode = nodes.find(n => n.id === modelIdMap[componentId]);
                    if (childNode) {
                        childNode.parentId = parentId;
                        childNode.extent = "parent";
                    }
                }
            });
        }
    });

    // Traiter les connexions avec la fonction récursive
    let tEdge = [];
    diagram.connections.forEach(conn => {
        tEdge.push(...splitConnection(conn, diagram));
    });

    // Génération des edges pour React Flow
    tEdge.forEach(conn => {
        edges.push({
            id: `e${conn.from.model}-${conn.to.model}`,
            source: modelIdMap[conn.from.model],
            sourceHandle: `out-${conn.from.port || "1"}`,
            target: modelIdMap[conn.to.model],
            targetHandle: `in-${conn.to.port || "1"}`,
            type: 'smoothstep',
        });
    });

    return { nodes, edges };
}





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
   /* const completion = await openai.beta.chat.completions.parse({
      model: 'deepseek-r1-distill-llama-70b',
      messages: [{ role: 'system', content: systemDiagramPrompt.trim() },
      { role: 'user', content: userPrompt },

      ],
      response_format: zodResponseFormat(DevsSchema , "DEVSSchema"),
      max_token: 4000,
      temperature: 0.9,
      top_p: 0.7
    });*/



    //const rawContent = completion.choices[0].message.parsed;

    const postTreatedContent = convertDevsToReactFlow(diagramExample);
    

    res.json(postTreatedContent);
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
