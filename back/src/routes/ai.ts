import "dotenv/config";
import express, { type Request, type Response } from "express";
import type jwt from "jsonwebtoken";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import authenticateToken from "../middlewares/auth";
import { diagramExample } from "../prompt/diagramExample";
import { systemDiagramPrompt } from "../prompt/diagram_prompt";
import { convertDevsToReactFlow } from "../utils/dataConversion";

const router = express.Router();

const PortSchema = z.object({
	in: z.array(z.string()).optional(),
	out: z.array(z.string()).optional(),
});

const ModelSchema = z.object({
	id: z.string(),
	type: z.enum(["atomic", "coupled"]),
	ports: PortSchema.optional(),
	components: z.array(z.string()).optional(),
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

// ✅ Vérifier que l'API OpenAI est bien configurée
if (!process.env.AI_API_KEY || !process.env.AI_API_URL) {
	console.error("❌ ERREUR : Clé API OpenAI ou URL non définie !");
	process.exit(1);
}

// ✅ Configuration OpenAI
const openai = new OpenAI({
	apiKey: process.env.AI_API_KEY as string,
	baseURL: process.env.AI_API_URL as string,
});

// ✅ Définition des interfaces
interface AuthenticatedRequest extends Request {
	user?: jwt.JwtPayload & { id?: string };
}

interface GenerateDiagramRequest extends AuthenticatedRequest {
	body: {
		diagramName: string;
		userPrompt: string;
	};
}

interface GenerateModelRequest extends AuthenticatedRequest {
	body: {
		modelName: string;
		modelType: string;
		previousModelsCode: string;
		userPrompt: string;
	};
}

// **Route : Générer un diagramme**
router.post(
	"/generate-diagram",
	authenticateToken,
	async (req: GenerateDiagramRequest, res: Response): Promise<void> => {
		const { diagramName, userPrompt } = req.body;

		console.log("tqsdqsd");
		if (!diagramName || diagramName.trim() === "") {
			res
				.status(400)
				.json({
					error:
						"Le champ 'diagramName' est requis et doit être une chaîne non vide.",
				});
			return;
		}
		if (!userPrompt || userPrompt.trim() === "") {
			res
				.status(400)
				.json({
					error:
						"Le champ 'userPrompt' est requis et doit être une chaîne non vide.",
				});
			return;
		}
		try {
			/*const completion = await openai.beta.chat.completions.parse({
      model: 'deepseek-r1-distill-llama-70b',
      messages: [{ role: 'system', content: systemDiagramPrompt.trim() },
      { role: 'user', content: userPrompt },

      ],
      response_format: zodResponseFormat(DevsSchema, "DEVSSchema"),
      max_token: 4000,
      temperature: 0.9,
      top_p: 0.7
    });

    const rawContent = completion.choices[0].message.parsed;
    
    if (!rawContent || !rawContent.models || !rawContent.connections) {
      res.status(500).json({ error: 'Erreur lors de la génération du diagramme avec l’IA.' });
      return;
    }*/

			const postTreatment = convertDevsToReactFlow(diagramExample);

			res.json(postTreatment);
			return;
		} catch (error) {
			console.error("Erreur lors de l’appel à vLLM :", error);
			res
				.status(500)
				.json({
					error: "Erreur lors de la génération du diagramme avec l’IA.",
				});
			return;
		}
	},
);

// **Route : Générer un modèle**
router.post(
	"/generate-model",
	authenticateToken,
	async (req: GenerateModelRequest, res: Response): Promise<void> => {
		const { modelName, modelType, previousModelsCode, userPrompt } = req.body;

		if (!modelName || modelName.trim() === "") {
			res
				.status(400)
				.json({
					error:
						"Le champ 'modelName' est requis et doit être une chaîne non vide.",
				});
			return;
		}
		if (!modelType || modelType.trim() === "") {
			res
				.status(400)
				.json({
					error:
						"Le champ 'modelType' est requis et doit être une chaîne non vide.",
				});
			return;
		}
		if (!previousModelsCode) {
			res
				.status(400)
				.json({
					error:
						"Le champ 'previousModelsCode' est requis et doit être une chaîne.",
				});
			return;
		}
		if (!userPrompt || userPrompt.trim() === "") {
			res
				.status(400)
				.json({
					error:
						"Le champ 'userPrompt' est requis et doit être une chaîne non vide.",
				});
			return;
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
			/*const completion = await openai.chat.completions.create({
      model: 'qwen2.5-coder',
      messages: [{ role: 'user', content: fullPrompt }],
    });


    if (!completion !==undefined || completion.choices) {
      res.status(500).json({ error: 'Erreur lors de la génération du modèle avec l’IA.' });
      return;
    }
    res.json((completion.choices[0] as never).message);*/
			res.json({ id: "123", code: "model code" });
			return;
		} catch (error) {
			console.error("Erreur lors de l’appel à vLLM :", error);
			res.status(500).json({ error: "Erreur lors de l'appel au modèle AI." });
			return;
		}
	},
);

export default router;
