INSERT INTO provinces (name, code) VALUES ('Maputo Cidade', 'MPT'), ('Maputo Provincia', 'MPP'), ('Gaza', 'GZA'), ('Inhambane', 'INH'), ('Sofala', 'SOF') ON CONFLICT (name) DO NOTHING;
INSERT INTO risk_types (name, color) VALUES ('Cheia', '#0000FF'), ('Ciclone', '#FF0000'), ('Seca', '#FFA500'), ('Deslizamento', '#8B4513') ON CONFLICT DO NOTHING;
INSERT INTO users (name, email, password_hash, role) VALUES ('Admin SIGRD', 'admin@sigrd.gov.mz', crypt('admin123', gen_salt('bf')), 'admin') ON CONFLICT (email) DO NOTHING;
