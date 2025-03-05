import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface AuthenticatedRequest extends Request {
	user?: jwt.JwtPayload & { id?: string };
}

const authenticateToken = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
): void => {
	const token = req.header("Authorization")?.split(" ")[1];

	if (!token) {
		res.status(401).send("Accès refusé. Aucun token fourni.");
		return;
	}

	jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
		if (err) {
			res.status(403).send("Token invalide.");
			return;
		}
		req.user = user as jwt.JwtPayload & { id?: string }; // Assurer que `user` contient un `id`
		next();
	});
};

export default authenticateToken;
