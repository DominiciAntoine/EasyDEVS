-- Création de la table pour les utilisateurs (déjà fournie)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Création de la table pour les diagrammes
CREATE TABLE diagrams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    current_model INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE -- Relation avec la table users
);

-- Création de la table pour les nodes
CREATE TABLE nodes (
    id SERIAL PRIMARY KEY,
    content TEXT,
    diagram_id INTEGER REFERENCES diagrams(id) ON DELETE CASCADE -- Relation avec la table diagrams
);

-- Création de la table pour les edges
CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    content TEXT,
    diagram_id INTEGER REFERENCES diagrams(id) ON DELETE CASCADE -- Relation avec la table diagrams
);

-- Création de la table pour les models
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    dependencies JSONB DEFAULT '[]',
    diagram_id INTEGER REFERENCES diagrams(id) ON DELETE CASCADE -- Relation avec la table diagrams
);

-- Gestion des privilèges
GRANT ALL PRIVILEGES ON DATABASE EASYDEVS TO easydevs;

-- Privilèges pour les nouvelles tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO easydevs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO easydevs;
