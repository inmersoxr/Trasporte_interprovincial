-- Separate platform authority: never inferred from operator memberships.
CREATE TABLE platform_admins (
 user_id TEXT PRIMARY KEY REFERENCES users(id),role TEXT NOT NULL CHECK(role IN('owner','auditor')),
 created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER platform_authority_audit AFTER INSERT ON platform_admins
BEGIN INSERT INTO audit_events(id,actor_user_id,entity_type,entity_id,action) VALUES('platform-authority:'||NEW.user_id,NEW.user_id,'platform_authority',NEW.user_id,'granted_'||NEW.role); END;
CREATE TABLE platform_subscriptions (
 operator_id TEXT PRIMARY KEY REFERENCES operators(id),plan TEXT NOT NULL CHECK(plan IN('standard','premium')),
 status TEXT NOT NULL CHECK(status IN('trial','active','paused','cancelled')),fee_cents INTEGER CHECK(fee_cents>=0),
 next_due_on TEXT,cycle_months INTEGER NOT NULL CHECK(cycle_months BETWEEN 1 AND 12),notes TEXT NOT NULL DEFAULT '',
 revision INTEGER NOT NULL,last_request TEXT NOT NULL,fingerprint TEXT NOT NULL,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE platform_invoices (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),period_start TEXT NOT NULL,period_end TEXT NOT NULL,
 due_on TEXT NOT NULL,amount_cents INTEGER NOT NULL CHECK(amount_cents>0),status TEXT NOT NULL DEFAULT 'open' CHECK(status IN('open','void')),
 created_by TEXT NOT NULL REFERENCES users(id),void_reason TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(operator_id,period_start,period_end)
);
CREATE INDEX platform_invoice_due ON platform_invoices(status,due_on,operator_id);
CREATE TABLE platform_payments (
 id TEXT PRIMARY KEY,invoice_id TEXT NOT NULL REFERENCES platform_invoices(id),amount_cents INTEGER NOT NULL CHECK(amount_cents>0),
 received_on TEXT NOT NULL,reference TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'recorded' CHECK(status IN('recorded','void')),
 created_by TEXT NOT NULL REFERENCES users(id),void_reason TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(invoice_id,reference)
);
CREATE INDEX platform_payments_invoice ON platform_payments(invoice_id,status);
CREATE TRIGGER platform_payment_balance BEFORE INSERT ON platform_payments
WHEN NOT EXISTS(SELECT 1 FROM platform_invoices i WHERE i.id=NEW.invoice_id AND i.status='open'
 AND NEW.amount_cents+COALESCE((SELECT SUM(p.amount_cents) FROM platform_payments p WHERE p.invoice_id=i.id AND p.status='recorded'),0)<=i.amount_cents)
BEGIN SELECT RAISE(ABORT,'platform_payment_conflict'); END;
CREATE TRIGGER platform_invoice_void_guard BEFORE UPDATE OF status ON platform_invoices
WHEN NEW.status='void' AND EXISTS(SELECT 1 FROM platform_payments p WHERE p.invoice_id=NEW.id AND p.status='recorded')
BEGIN SELECT RAISE(ABORT,'platform_invoice_has_payments'); END;
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0013_platform_admin');
