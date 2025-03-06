import "dotenv/config";
import { Pool, type PoolClient } from "pg";

const db = new Pool({
	host: process.env.DB_HOST as string,
	user: process.env.DB_USER as string,
	password: process.env.DB_PASSWORD as string,
	database: process.env.DB_NAME as string,
	port: process.env.DB_PORT ? Number.parseInt(process.env.DB_PORT) : 5432,
});

let tryConnect = 0;
let success = false;

function tryConnection(): void {
	db.connect(
		(
			err: Error | undefined,
			client: PoolClient | undefined,
			release?: () => void,
		) => {
			if (err) {
				// TypeScript est content maintenant !
				console.error("Erreur de connexion à la base de données:", err);
				tryConnect++;

				if (tryConnect >= 3) {
					process.exit(1);
				} else {
					setTimeout(() => tryConnection(), 3000);
				}
			} else {
				success = true;
				console.log("Connecté à la base de données PostgreSQL");
				release?.(); // Libérer la connexion si nécessaire
			}
		},
	);
}

tryConnection();

export default db;
