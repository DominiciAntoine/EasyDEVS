import "dotenv/config";
import bcrypt from "bcryptjs";
import express, { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import db from "../config/db";
import authenticateToken from "../middlewares/auth";

const isProduction = process.env.NODE_ENV === "production";
const router = express.Router();

interface AuthRequest extends Request {
	user?: { id: number };
}

// ✅ Interface pour `req.body` dans login/register
interface AuthBody {
	email: string;
	password: string;
}

// **✅ Connexion**
router.post(
	"/login",
	async (
		req: Request<unknown, unknown, AuthBody>,
		res: Response,
	): Promise<void> => {
		const { email, password } = req.body;
		const sql = "SELECT * FROM users WHERE email = $1";
		db.query(sql, [email], async (err, results) => {
			if (err || !results || results.rows.length === 0) {
				res.status(401).json({ message: "Utilisateur non trouvé" });
				return;
			}

			const user = results.rows[0];
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				res.status(401).json({ message: "Mot de passe incorrect" });
				return;
			}

			const accessToken = jwt.sign(
				{ id: user.id },
				process.env.JWT_SECRET as string,
				{ expiresIn: "1h" },
			);
			const refreshToken = jwt.sign(
				{ id: user.id },
				process.env.REFRESH_TOKEN_SECRET as string,
				{ expiresIn: "7d" },
			);

			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "none" : "lax",
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});

			res.status(200).json({ message: "Connexion réussie", accessToken });
			return;
		});
	},
);

// **✅ Inscription**
router.post(
	"/register",
	async (
		req: Request<unknown, unknown, AuthBody>,
		res: Response,
	): Promise<void> => {
		const { email, password } = req.body;
		if (!email || !password) {
			res.status(400).json({ message: "Email et mot de passe requis" });
			return;
		}

		try {
			const sqlCheck = "SELECT * FROM users WHERE email = $1";
			db.query(sqlCheck, [email], async (err, results) => {
				if (err) {
					res.status(500).json({ message: "Erreur lors de la vérification" });
					return;
				}
				if (results.rows.length > 0) {
					res.status(409).json({ message: "Utilisateur existe déjà" });
					return;
				}

				const hashedPassword = await bcrypt.hash(password, 10);
				const sqlInsert = "INSERT INTO users (email, password) VALUES ($1, $2)";
				db.query(sqlInsert, [email, hashedPassword], (err) => {
					if (err) {
						res
							.status(500)
							.json({ message: "Erreur lors de l'enregistrement" });
						return;
					}
					res.status(201).json({ message: "Utilisateur créé avec succès" });
					return;
				});
			});
		} catch (error) {
			res.status(500).json({ message: "Erreur serveur", error });
			return;
		}
	},
);

// **✅ Récupération des infos utilisateur**
router.get(
	"/me",
	authenticateToken,
	(req: AuthRequest, res: Response): void => {
		const sql = "SELECT id, email FROM users WHERE id = $1";
		db.query(sql, [req.user?.id], (err, results) => {
			if (err || !results || results.rows.length === 0) {
				res.status(404).json({ message: "Utilisateur non trouvé" });
				return;
			}
			res.status(200).json(results.rows[0]);
			return;
		});
	},
);

// **✅ Rafraîchissement du token**
router.post(
	"/refresh-token",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const refreshToken = req.cookies?.refreshToken;
			if (!refreshToken) {
				res.status(401).json({ message: "Refresh token required" });
				return;
			}

			jwt.verify(
				refreshToken,
				process.env.REFRESH_TOKEN_SECRET as string,
				(
					err: jwt.VerifyErrors | null,
					decoded: string | jwt.JwtPayload | undefined,
				) => {
					if (
						err ||
						!decoded ||
						typeof decoded !== "object" ||
						!("id" in decoded)
					) {
						res.status(403).json({ message: "Invalid refresh token" });
						return;
					}

					const sql = "SELECT id, email FROM users WHERE id = $1";
					db.query(sql, [decoded.id], (err, results) => {
						if (err || !results || results.rows.length === 0) {
							res.status(404).json({ message: "User not found" });
							return;
						}

						const accessToken = jwt.sign(
							{ id: decoded.id },
							process.env.JWT_SECRET as string,
							{ expiresIn: "1h" },
						);
						const newRefreshToken = jwt.sign(
							{ id: decoded.id },
							process.env.REFRESH_TOKEN_SECRET as string,
							{ expiresIn: "7d" },
						);

						res.cookie("refreshToken", newRefreshToken, {
							httpOnly: true,
							secure: isProduction,
							sameSite: isProduction ? "none" : "lax",
							maxAge: 7 * 24 * 60 * 60 * 1000,
						});

						res.status(200).json({ accessToken });
						return;
					});
				},
			);
		} catch (error) {
			console.error("Erreur lors du rafraîchissement du token :", error);
			res.status(500).json({ message: "Erreur serveur", error });
			return;
		}
	},
);

// **✅ Déconnexion**
router.post(
	"/logout",
	authenticateToken,
	async (req: AuthRequest, res: Response): Promise<void> => {
		try {
			res.clearCookie("refreshToken", {
				httpOnly: true,
				secure: isProduction,
				sameSite: isProduction ? "none" : "lax",
			});

			res.status(200).json({ message: "Déconnexion réussie" });
			return;
		} catch (error) {
			console.error("Erreur lors de la déconnexion :", error);
			res.status(500).json({ message: "Erreur serveur", error });
			return;
		}
	},
);

export default router;
