import express, { type Request, type Response } from "express";
import db from "../config/db";
import authenticateToken from "../middlewares/auth";
import type { Edge, ReactFlowInput } from "../types";

const router = express.Router();

// ✅ Interface pour req.user
interface AuthRequest extends Request {
	user?: { id: number };
}

// ✅ Interface pour `save-diagram`
interface SaveDiagramRequest extends AuthRequest {
	body: {
		diagramId?: number;
		name: string;
		nodes: ReactFlowInput[];
		edges: Edge[];
		models?: { name: string; code: string; dependencies?: string[] }[];
		currentModel?: string;
	};
}

// **✅ Route : Enregistrer un diagramme**
router.post(
	"/save-diagram",
	authenticateToken,
	async (req: SaveDiagramRequest, res: Response): Promise<void> => {
		let { diagramId, name, nodes, edges, models, currentModel } = req.body;

		if (!name || !nodes || !edges || !currentModel || !models) {
			res.status(400).json({
				error:
					"Les champs 'name', 'nodes', 'edges', 'currentModel' et 'models' sont obligatoires.",
			});
			return;
		}

		try {
			await db.query("BEGIN");

			if (diagramId) {
				await db.query(
					"UPDATE diagrams SET name = $1, current_model = $2 WHERE id = $3",
					[name, currentModel, diagramId],
				);

				await Promise.all([
					db.query("DELETE FROM nodes WHERE diagram_id = $1", [diagramId]),
					db.query("DELETE FROM edges WHERE diagram_id = $1", [diagramId]),
					db.query("DELETE FROM models WHERE diagram_id = $1", [diagramId]),
				]);
			} else {
				const diagramResult = await db.query(
					"INSERT INTO diagrams (name, current_model) VALUES ($1, $2) RETURNING id",
					[name, currentModel],
				);

				if (!diagramResult || diagramResult.rows.length === 0) {
					throw new Error("Échec de la création du diagramme.");
				}

				diagramId = diagramResult.rows[0].id;
			}

			await db.query(
				"INSERT INTO nodes (content, diagram_id) VALUES ($1, $2)",
				[nodes, diagramId],
			);
			await db.query(
				"INSERT INTO edges (content, diagram_id) VALUES ($1, $2)",
				[edges, diagramId],
			);

			const modelPromises = models.map((model) =>
				db.query(
					"INSERT INTO models (name, code, dependencies, diagram_id) VALUES ($1, $2, $3, $4)",
					[
						model.name,
						model.code,
						JSON.stringify(model.dependencies || []),
						diagramId,
					],
				),
			);
			await Promise.all(modelPromises);

			await db.query("COMMIT");

			res.status(201).json({
				success: true,
				message: diagramId
					? "Diagramme mis à jour avec succès!"
					: "Diagramme enregistré avec succès!",
				diagramId,
			});
			return;
		} catch (error) {
			await db.query("ROLLBACK");
			console.error("Erreur lors de l'enregistrement du diagramme:", error);
			res.status(500).json({ error: "Échec de l'opération." });
			return;
		}
	},
);

// ✅ Interface pour `get-diagram`
interface GetDiagramRequest extends AuthRequest {
	params: {
		diagramId: string;
	};
}

// **✅ Route : Récupérer un diagramme**
router.get(
	"/get-diagram/:diagramId",
	authenticateToken,
	async (req: GetDiagramRequest, res: Response): Promise<void> => {
		const { diagramId } = req.params;

		if (!diagramId) {
			res.status(400).json({ error: "Le paramètre diagramId est requis." });
			return;
		}

		try {
			const diagramResult = await db.query(
				"SELECT * FROM diagrams WHERE id = $1",
				[Number.parseInt(diagramId)],
			);
			if (!diagramResult || diagramResult.rows.length === 0) {
				res.status(404).json({ error: "Diagramme introuvable." });
				return;
			}

			const [nodesResult, edgesResult, modelsResult] = await Promise.all([
				db.query("SELECT * FROM nodes WHERE diagram_id = $1", [diagramId]),
				db.query("SELECT * FROM edges WHERE diagram_id = $1", [diagramId]),
				db.query("SELECT * FROM models WHERE diagram_id = $1", [diagramId]),
			]);

			res.status(200).json({
				success: true,
				diagram: diagramResult.rows[0],
				nodes: nodesResult.rows,
				edges: edgesResult.rows,
				models: modelsResult.rows,
			});
			return;
		} catch (error) {
			console.error("Erreur lors de la récupération du diagramme:", error);
			res.status(500).json({ error: "Échec de la récupération du diagramme." });
			return;
		}
	},
);

// **✅ Route : Récupérer tous les diagrammes**
router.get(
	"/get-all-diagrams",
	authenticateToken,
	async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({ error: "Utilisateur non authentifié." });
				return;
			}

			const result = await db.query(
				"SELECT id, name FROM diagrams WHERE user_id = $1",
				[userId],
			);

			if (!result) {
				res
					.status(500)
					.json({ error: "Erreur lors de la récupération des diagrammes." });
				return;
			}

			res.status(200).json({
				success: true,
				diagrams: result.rows,
			});
			return;
		} catch (error) {
			console.error("Erreur lors de la récupération des diagrammes:", error);
			res
				.status(500)
				.json({ error: "Échec de la récupération des diagrammes." });
			return;
		}
	},
);

export default router;
