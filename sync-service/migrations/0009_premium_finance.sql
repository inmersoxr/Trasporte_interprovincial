CREATE TABLE premium_expenses (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),vehicle_id TEXT REFERENCES vehicles(id),
 category TEXT NOT NULL CHECK(category IN('fuel','maintenance','tolls','other')),description TEXT NOT NULL,
 amount_cents INTEGER NOT NULL CHECK(amount_cents>0),incurred_on TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'posted' CHECK(status IN('posted','void')),
 created_by TEXT NOT NULL REFERENCES users(id),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 void_reason TEXT,voided_at TEXT
);
CREATE INDEX premium_expenses_period ON premium_expenses(operator_id,incurred_on,status);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0009_premium_finance');
