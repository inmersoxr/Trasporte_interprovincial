-- Functional Cloudflare application only; never apply to the R2 demo.
ALTER TABLE auth_transactions ADD COLUMN return_path TEXT;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0015_checkout_identity');
