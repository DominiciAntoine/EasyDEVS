const { diagramExample } = require("./diagramExample");

const systemDiagramPrompt = `
### Objectif
Créer une structure JSON représentant un diagramme DEVS valide, basée sur les schémas fournis.

Tu doit faire un shema pour devs basé sur React Flow pour faire les diagrammes.

Voici a présent un exemple de diagramme : 


` + diagramExample;


module.exports = { systemDiagramPrompt }