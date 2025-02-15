import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Request,
	type Response,
	type NextFunction,
} from "express";
import db from "./config/db";

import aiRoutes from "./routes/ai.js";
// ✅ Import des routes avec le bon format
import authRoutes from "./routes/auth.js";
import dataRoutes from "./routes/data.js";

const app = express();
const port = process.env.PORT || 3000;

// ✅ Middleware JSON et cookies
app.use(express.json());
app.use(cookieParser());

// ✅ Configuration CORS
app.use(
	cors({
		origin: process.env.CLIENT_URL, // Front-end autorisé
		credentials: true, // Permet l'envoi des cookies
	}),
);

// ✅ Vérification que les routes sont bien des fonctions `router`
if (
	typeof authRoutes !== "function" ||
	typeof aiRoutes !== "function" ||
	typeof dataRoutes !== "function"
) {
	console.error(
		"❌ Erreur : Une des routes n'exporte pas correctement `router`.",
	);
	process.exit(1);
}

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/data", dataRoutes);

// ✅ Connexion à la base de données avec gestion des erreurs
db.connect((err: Error | undefined) => {
	if (err) {
		console.error("❌ Erreur de connexion à la base de données :", err);
	} else {
		console.log("✅ Connecté à la base de données MySQL");
	}
});

// ✅ Lancement du serveur
app.listen(port, () => {
	console.log(`🚀 Serveur démarré sur le port ${port}`);
});

export default app;
