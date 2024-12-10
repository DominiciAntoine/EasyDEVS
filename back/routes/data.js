const express = require('express');
const authenticateToken = require('../middlewares/auth'); // Middleware pour authentification JWT
const db = require('../config/db'); // Import de la configuration PostgreSQL

const router = express.Router();

/**
 * Route : Enregistrer un diagramme
 */
router.post('/save-diagram', authenticateToken, async (req, res) => {
    let { diagramId, name, nodes, edges, models, currentModel } = req.body;

    if (!name || !nodes || !edges) {
        return res.status(400).json({
            error: "Les champs 'name', 'nodes', 'edges', currentModel et 'models' sont obligatoires.",
        });
    }

    try {
        // Démarrer une transaction
        await db.query('BEGIN');

        if (diagramId) {
            // **Mise à jour du diagramme existant**
            await db.query(
                'UPDATE diagrams SET name = $1, current_model = $2 WHERE id = $3',
                [name , currentModel, diagramId]
            );

            // Supprimez les anciennes données associées (facultatif, en fonction de vos besoins)
            await Promise.all([
                db.query('DELETE FROM nodes WHERE diagram_id = $1', [diagramId]),
                db.query('DELETE FROM edges WHERE diagram_id = $1', [diagramId]),
                db.query('DELETE FROM models WHERE diagram_id = $1', [diagramId]),
            ]);
        } else {
            // **Insertion d'un nouveau diagramme**
            let diagramResult = await db.query(
                'INSERT INTO diagrams (name, current_model) VALUES ($1, $2) RETURNING id',
                [name, currentModel]
            );
            diagramId = diagramResult.rows[0].id;
        }

        // Insérer les nodes
        
        let nodePromises = db.query(
            'INSERT INTO nodes (content, diagram_id) VALUES ($1, $2)',
            [
                nodes,
                diagramId
            ]
        )
        
        await Promise.resolve(nodePromises);

        // Insérer les edges
    
        let edgePromises = db.query(
                'INSERT INTO edges (content, diagram_id) VALUES ($1, $2)',
                [
                    edges,
                    diagramId,
                ]
            )
        await Promise.resolve(edgePromises);

        // Insérer les models
        if (!models && !currentModel)
        {
            let modelPromises = models.map((model) =>
            db.query(
                'INSERT INTO models (name, code, dependencies, diagram_id) VALUES ($1, $2, $3, $4)',
                [
                    model.name,
                    model.code,
                    JSON.stringify(model.dependencies || []),
                    diagramId,
                ]
            )
            );
            await Promise.all(modelPromises);
        }
        

        // Confirmer la transaction
        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            message: diagramId ? 'Diagramme mis à jour avec succès!' : 'Diagramme enregistré avec succès!',
            diagramId,
        });
    } catch (error) {
        // Annuler la transaction en cas d'erreur
        await db.query('ROLLBACK');
        console.error('Erreur lors de l\'enregistrement ou de la mise à jour du diagramme:', error);
        res.status(500).json({ error: 'Échec de l\'opération.' });
    }
});

/**
 * Route : Récupérer un diagramme
 */
router.get('/get-diagram/:diagramId', authenticateToken, async (req, res) => {
    const { diagramId } = req.params;

    if (!diagramId) {
        return res.status(400).json({ error: 'Le paramètre diagramId est requis.' });
    }

    try {
        // Récupérer le diagramme principal
        const diagramResult = await db.query(
            'SELECT * FROM diagrams WHERE id = $1',
            [diagramId]
        );

        if (diagramResult.rows.length === 0) {
            return res.status(404).json({ error: 'Diagramme introuvable.' });
        }

        const diagram = diagramResult.rows[0];

        // Récupérer les nodes, edges, et models associés
        const [nodesResult, edgesResult, modelsResult] = await Promise.all([
            db.query('SELECT * FROM nodes WHERE diagram_id = $1', [diagramId]),
            db.query('SELECT * FROM edges WHERE diagram_id = $1', [diagramId]),
            db.query('SELECT * FROM models WHERE diagram_id = $1', [diagramId]),
        ]);

        const nodes = nodesResult.rows;
        const edges = edgesResult.rows;
        const models = modelsResult.rows;

        res.status(200).json({
            success: true,
            diagram,
            nodes,
            edges,
            models,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du diagramme:', error);
        res.status(500).json({ error: 'Échec de la récupération du diagramme.' });
    }
});

/**
 * Route : Récupérer tous les diagrammes (noms et IDs uniquement)
 */
router.get('/get-all-diagrams', authenticateToken, async (req, res) => {
    try {
        // Récupérer l'ID de l'utilisateur à partir du token
        const userId = req.user.id;

        // Requête pour récupérer les diagrammes de l'utilisateur
        const result = await db.query('SELECT id, name FROM diagrams WHERE user_id = $1', [userId]);

        res.status(200).json({
            success: true,
            diagrams: result.rows,
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des diagrammes:', error);
        res.status(500).json({ error: 'Échec de la récupération des diagrammes.' });
    }
});

module.exports = router;
