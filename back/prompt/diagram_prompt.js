const systemDiagramPrompt = `
### Objectif
Créer une structure JSON représentant un diagramme DEVS valide, basée sur les schémas fournis.

### Instructions Générales
1. La réponse doit **uniquement** contenir un JSON valide. **Aucun texte ou commentaire explicatif n'est attendu.**
2. Les données doivent respecter les schémas suivants :
   - **NodeSchema** pour les nœuds.
   - **EdgeSchema** pour les connexions.
   - **DEVSDiagramSchema** pour le diagramme complet.

---

### Structure des Nœuds (nodes)
Chaque nœud doit inclure :
- \`id\` : Identifiant unique du nœud (string).
- \`type\` : Toujours \`resizer\`.
- \`data\` :
  - \`modelType\` : \`atomic\` ou \`coupled\`.
  - \`label\` : Nom du modèle (string).
  - \`inputPorts\` et \`outputPorts\` : Listes d’objets contenant des IDs pour les ports. ex: "inputPorts": [{ "id": "1" },{ "id": "2" }],
- \`position\` : Coordonnées \`{ x: number, y: number }\`.
- \`style\` (facultatif) : Dimensions \`{ width: number, height: number }\`.
- \`parentId\` et \`extent\` :
  - Optionel : À inclure seulemennt si le nœud est un **enfant dans un modèle couplé**. Le parent id ne sera jamais null ou none, dans ces deux cas il ne devra juste pas être renseigner.

---

### Structure des Connexions (edges)
Chaque connexion doit inclure :
- \`id\` : Identifiant unique de la connexion (string).
- \`source\` : ID du nœud source (string).
- \`sourceHandle\` : ID unique du port source (string). 4 choix : in-$port | in-internal-$port  | out-$port | out-internal-$port
  - pour les model atomique 2 choix :
    - Port d'entrée : in-$port
    - Port de sortie : out-$port
  - pour les model couplé 4 choix :
    - Port d'entrée est divisé en deux port : 
      - in-$port sera le port d'entré du modèle
      - in-internal-$port sera le port de sortie d'entrée du modèle
    - Port de sortie est divisé en deux port : 
      - out-$port sera le port de sortie du modèle
      - out-internal-$port sera le port de d'entrée de la sortie du modèle
- \`target\` : ID du nœud cible (string).
- \`targetHandle\` : ID unique du port cible (string). 4 choix : in-$port | in-internal-$port | out-$port | out-internal-$port
- \`type\` : Type de connexion (string).

---

### Exemple attendu
Un exemple minimal illustrant ces structures :
\`\`\`json
{
  "nodes": [
    {
      "id": "1",
      "type": "resizer",
      "data": {
        "modelType": "atomic",
        "label": "Atomic Model 1",
        "inputPorts": [{ "id": "1" }],
        "outputPorts": [{ "id": "1" }]
      },
      "position": { "x": 50, "y": 100 }
    },
    {
      "id": "2",
      "type": "resizer",
      "data": {
        "modelType": "coupled",
        "label": "Coupled Model",
        "inputPorts": [{ "id": "1" }],
        "outputPorts": [{ "id": "1" }],
      },
      "position": { "x": 200, "y": 200 }
    },
    {
      "id": "3",
      "type": "resizer",
      "data": {
        "modelType": "atomic",
        "label": "Child Atomic Model",
        "inputPorts": [{ "id": "1" }],
        "outputPorts": [{ "id": "1" }]
      },
      "position": { "x": 100, "y": 150 },
      "parentId": "2",
      "extent": "parent"
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "1",
      "sourceHandle": "out-1",
      "target": "2",
      "targetHandle": "in-1",
      "type": "smoothstep"
    }
  ]
}
\`\`\`

---

### Rappels Importants
1. **Ne pas inclure \`parentId\` et \`extent\`** pour les nœuds autonomes.
2. Tous les **IDs doivent être uniques** pour les nœuds, ports, et connexions.
3. Les **\`sourceHandle\`** et **\`targetHandle\`** doivent également être **uniques**.
4. Le JSON doit être prêt à l'emploi et valide dans un environnement JavaScript.
`;


module.exports = { systemDiagramPrompt }