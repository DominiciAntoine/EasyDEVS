-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Table des librairies
CREATE TABLE library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Table des modèles
CREATE TABLE models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    lib_id UUID REFERENCES library(id) ON DELETE CASCADE,
    metadata_json JSONB DEFAULT '{}',
    components_json JSONB DEFAULT '[]',
    connections_json JSONB DEFAULT '[]',
    port_in_json JSONB DEFAULT '[]',
    port_out_json JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE
);

-- Table des codes
CREATE TABLE code (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id UUID REFERENCES models(id) ON DELETE CASCADE,
    language VARCHAR(20) NOT NULL,
    code TEXT NOT NULL
);

-- Gestion des privilèges
GRANT ALL PRIVILEGES ON DATABASE EASYDEVS TO easydevs;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO easydevs;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO easydevs;
