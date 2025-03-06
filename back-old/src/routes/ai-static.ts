import "dotenv/config";
import express, { type Request, type Response } from "express";
import authenticateToken from "../middlewares/auth";
import { modelExample } from "../prompt/ModelExample";
import { diagramExample } from "../prompt/diagramExample";

const router = express.Router();

// ✅ Interfaces pour `req.body`
interface GenerateDiagramRequest extends Request {
	body: {
		diagramName: string;
		userPrompt: string;
	};
}

interface GenerateModelRequest extends Request {
	body: {
		modelName: string;
		previousModelsCode: string;
		userPrompt: string;
	};
}

// **Route pour générer un diagramme**
router.post(
	"/generate-diagram",
	authenticateToken,
	async (req: GenerateDiagramRequest, res: Response): Promise<void> => {
		const { diagramName, userPrompt } = req.body;

		if (!diagramName || diagramName.trim() === "") {
			res.status(400).json({
				error:
					"Le champ 'diagramName' est requis et doit être une chaîne de caractères non vide.",
			});
			return;
		}
		if (!userPrompt || userPrompt.trim() === "") {
			res.status(400).json({
				error:
					"Le champ 'userPrompt' est requis et doit être une chaîne de caractères non vide.",
			});
			return;
		}

		res.json(diagramExample);
	},
);

// **Route pour générer un modèle**
router.post(
	"/generate-model",
	authenticateToken,
	async (req: GenerateModelRequest, res: Response): Promise<void> => {
		const { modelName, previousModelsCode, userPrompt } = req.body;

		if (!modelName || modelName.trim() === "") {
			res.status(400).json({
				error:
					"Le champ 'modelName' est requis et doit être une chaîne de caractères non vide.",
			});
			return;
		}
		if (!previousModelsCode) {
			res.status(400).json({
				error:
					"Le champ 'previousModelsCode' est requis et doit être une chaîne de caractères.",
			});
			return;
		}
		if (!userPrompt || userPrompt.trim() === "") {
			res.status(400).json({
				error:
					"Le champ 'userPrompt' est requis et doit être une chaîne de caractères non vide.",
			});
			return;
		}

		res.json(modelExample);
	},
);

export default router;
