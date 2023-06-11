CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    access_token VARCHAR(255),
    refresh_token VARCHAR(255),
    expires_at BIGINT
);

