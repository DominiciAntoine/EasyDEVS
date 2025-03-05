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
		const userId = req.user?.id; // 🔹 Récupère l'ID utilisateur depuis le token

		if (!userId) {
			res.status(401).json({ error: "Utilisateur non authentifié." });
			return;
		}

		if (!name || !nodes || !edges || currentModel === undefined || !models) {
			res.status(400).json({
				error:
					"Les champs 'name', 'nodes', 'edges', 'currentModel' et 'models' sont obligatoires.",
			});
			return;
		}

		try {
			await db.query("BEGIN"); // Démarrer une transaction sécurisée

			// 🔹 Cas 1 : Création d'un nouveau diagramme avec `user_id`
			if (!diagramId) {
				const diagramResult = await db.query(
					"INSERT INTO diagrams (name, current_model, user_id) VALUES ($1, $2, $3) RETURNING id",
					[name, currentModel, userId],
				);

				if (!diagramResult || diagramResult.rows.length === 0) {
					throw new Error("Échec de la création du diagramme.");
				}

				diagramId = diagramResult.rows[0].id;
				console.log("✅ Diagramme créé avec ID :", diagramId);
			} else {
				// 🔹 Cas 2 : Mise à jour d'un diagramme existant (vérifie aussi `user_id`)
				const updateResult = await db.query(
					"UPDATE diagrams SET name = $1, current_model = $2 WHERE id = $3 AND user_id = $4 RETURNING id",
					[name, currentModel, diagramId, userId],
				);

				if (updateResult.rowCount === 0) {
					throw new Error(
						`Diagramme avec ID ${diagramId} introuvable ou non autorisé.`,
					);
				}

				console.log(`✅ Diagramme ${diagramId} mis à jour avec succès.`);

				// Supprime les anciennes données associées
				await Promise.all([
					db.query("DELETE FROM nodes WHERE diagram_id = $1", [diagramId]),
					db.query("DELETE FROM edges WHERE diagram_id = $1", [diagramId]),
					db.query("DELETE FROM models WHERE diagram_id = $1", [diagramId]),
				]);
			}

			// 🔹 Vérification : Le diagramme existe bien en base avant d'insérer les modèles
			const checkDiagram = await db.query(
				"SELECT id FROM diagrams WHERE id = $1 AND user_id = $2",
				[diagramId, userId],
			);
			if (checkDiagram.rows.length === 0) {
				throw new Error(
					`Le diagramme avec ID ${diagramId} n'existe pas ou ne vous appartient pas.`,
				);
			}

			console.log(
				"✅ Diagramme validé pour l'insertion des données :",
				diagramId,
			);

			// 🔹 Insertion des noeuds et connexions
			if (nodes.length > 0) {
				await db.query(
					"INSERT INTO nodes (content, diagram_id) VALUES ($1, $2)",
					[nodes, diagramId],
				);
			}

			if (edges.length > 0) {
				await db.query(
					"INSERT INTO edges (content, diagram_id) VALUES ($1, $2)",
					[edges, diagramId],
				);
			}

			// 🔹 COMMIT intermédiaire pour éviter les conflits avec les modèles
			await db.query("COMMIT");
			await db.query("BEGIN");

			console.log(
				"✅ Transaction COMMIT effectuée avant l'insertion des modèles.",
			);

			// 🔹 Vérification finale avant d'insérer les modèles
			const checkDiagramFinal = await db.query(
				"SELECT id FROM diagrams WHERE id = $1",
				[diagramId],
			);
			if (checkDiagramFinal.rows.length === 0) {
				throw new Error(
					`⚠ Erreur critique : le diagramme avec ID ${diagramId} a disparu avant l'insertion des modèles.`,
				);
			}

			// 🔹 Insertion des modèles
			if (models.length > 0) {
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
			}

			await db.query("COMMIT"); // 🔹 Confirmer la transaction finale

			res.status(201).json({
				success: true,
				message: "Diagramme enregistré avec succès!",
				diagramId,
			});
		} catch (error) {
			await db.query("ROLLBACK"); // 🔹 Annuler la transaction en cas d'erreur
			console.error("❌ Erreur lors de l'enregistrement du diagramme:", error);
			res.status(500).json({ error: "Échec de l'opération." });
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
		const userId = req.user?.id; // 🔹 Récupération de l'ID utilisateur depuis le token

		if (!userId) {
			res.status(401).json({ error: "Utilisateur non authentifié." });
			return;
		}

		if (!diagramId) {
			res.status(400).json({ error: "Le paramètre diagramId est requis." });
			return;
		}

		try {
			// 🔹 Vérifie si le diagramme appartient à l'utilisateur
			const diagramResult = await db.query(
				"SELECT * FROM diagrams WHERE id = $1 AND user_id = $2",
				[Number.parseInt(diagramId), userId],
			);

			if (!diagramResult || diagramResult.rows.length === 0) {
				res
					.status(404)
					.json({ error: "Diagramme introuvable ou accès non autorisé." });
				return;
			}

			console.log(`Utilisateur ${userId} accède au diagramme ${diagramId}`);

			// 🔹 Récupère les données associées au diagramme
			const [nodesResult, edgesResult, modelsResult] = await Promise.all([
				db.query("SELECT * FROM nodes WHERE diagram_id = $1", [diagramId]),
				db.query("SELECT * FROM edges WHERE diagram_id = $1", [diagramId]),
				db.query("SELECT * FROM models WHERE diagram_id = $1", [diagramId]),
			]);

			// 🔹 Renvoie le diagramme avec ses éléments
			res.status(200).json({
				success: true,
				diagram: diagramResult.rows[0],
				nodes: nodesResult.rows,
				edges: edgesResult.rows,
				models: modelsResult.rows,
			});
		} catch (error) {
			console.error("Erreur lors de la récupération du diagramme:", error);
			res.status(500).json({ error: "Échec de la récupération du diagramme." });
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
				console.warn("Accès refusé: utilisateur non authentifié.");
				res.status(401).json({ error: "Utilisateur non authentifié." });
				return;
			}

			console.log("Récupération des diagrammes pour userId:", userId);

			const { rows: diagrams } = await db.query(
				"SELECT id, name FROM diagrams WHERE user_id = $1",
				[userId],
			);

			res.status(200).json({
				success: true,
				diagrams,
			});
		} catch (error) {
			console.error("Erreur lors de la récupération des diagrammes:", error);
			res
				.status(500)
				.json({ error: "Échec de la récupération des diagrammes." });
		}
	},
);

interface DeleteDiagramRequest extends AuthRequest {
	params: {
		diagramId: string;
	};
}

router.delete(
	"/delete-diagram/:diagramId",
	authenticateToken,
	async (req: DeleteDiagramRequest, res: Response): Promise<void> => {
		const { diagramId } = req.params;
		const userId = req.user?.id; // 🔹 Récupération de l'ID utilisateur depuis le token

		if (!userId) {
			res.status(401).json({ error: "Utilisateur non authentifié." });
			return;
		}

		if (!diagramId) {
			res.status(400).json({ error: "Le paramètre diagramId est requis." });
			return;
		}

		try {
			// 🔹 Vérifie si le diagramme appartient à l'utilisateur avant suppression
			const diagramCheck = await db.query(
				"SELECT id FROM diagrams WHERE id = $1 AND user_id = $2",
				[Number.parseInt(diagramId), userId],
			);

			if (!diagramCheck || diagramCheck.rows.length === 0) {
				res
					.status(404)
					.json({ error: "Diagramme introuvable ou accès non autorisé." });
				return;
			}

			console.log(
				`✅ Utilisateur ${userId} supprime le diagramme ${diagramId}`,
			);

			// 🔹 Suppression du diagramme (les dépendances sont supprimées grâce à `ON DELETE CASCADE`)
			await db.query("DELETE FROM diagrams WHERE id = $1", [diagramId]);

			res.status(200).json({
				success: true,
				message: "Diagramme supprimé avec succès.",
			});
		} catch (error) {
			console.error("❌ Erreur lors de la suppression du diagramme:", error);
			res.status(500).json({ error: "Échec de la suppression du diagramme." });
		}
	},
);

export default router;
