-- Création de la table pour les utilisateurs (déjà fournie)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);


-- Création de la table pour les librairies
CREATE TABLE library (
    id SERIAL PRIMARY KEY,
    label VARCHAR(255) NOT NULL,
    description TEXT
);

-- Création de la table pour les models
CREATE TABLE models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    lib_id INTEGER REFERENCES library(id) ON DELETE CASCADE,
    metadata_json JSONB DEFAULT '{}',
    components_json JSONB DEFAULT '[]',
    connections_json JSONB DEFAULT '[]',
    port_in_json JSONB DEFAULT '[]',
    port_out_json JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE -- Relation avec la table users
);

-- Création de la table pour les codes
CREATE TABLE code (
    id SERIAL PRIMARY KEY,
    model_id INTEGER REFERENCES models(id) ON DELETE CASCADE,
    language VARCHAR(20) NOT NULL,
    code TEXT NOT NULL
);

-- Gestion des privilèges
GRANT ALL PRIVILEGES ON DATABASE EASYDEVS TO easydevs;

-- Privilèges pour les nouvelles tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO easydevs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO easydevs;
