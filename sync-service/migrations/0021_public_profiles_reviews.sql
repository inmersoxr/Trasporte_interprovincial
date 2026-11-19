-- Reuse existing profile/media storage for Standard as well as Premium.
ALTER TABLE premium_media ADD COLUMN filename TEXT NOT NULL DEFAULT 'Imagen';
ALTER TABLE premium_profiles ADD COLUMN vehicle_photos_json TEXT NOT NULL DEFAULT '{}';
CREATE VIEW standard_review_eligibility AS
 SELECT b.customer_id AS user_id,m.operator_id,b.id AS booking_id,'standard' AS booking_kind,
  CASE WHEN b.departure_id IS NOT NULL THEN 'departure:'||b.departure_id ELSE 'booking:'||b.id END AS service_key,b.service_at
 FROM bookings b JOIN standard_booking_details m ON m.booking_id=b.id
 WHERE b.status='confirmed' AND EXISTS(SELECT 1 FROM standard_passengers p WHERE p.booking_id=b.id AND p.boarded_at IS NOT NULL)
 AND (EXISTS(SELECT 1 FROM departures d WHERE d.id=b.departure_id AND d.status='completed')
  OR EXISTS(SELECT 1 FROM standard_tracking t WHERE (t.booking_id=b.id OR t.departure_id=b.departure_id) AND t.service_status='completed'))
 UNION ALL SELECT customer_id,operator_id,id,'custom','custom:'||id,service_at
 FROM standard_custom_bookings WHERE status='completed' AND boarded_at IS NOT NULL;
CREATE TABLE standard_reviews (
 id TEXT PRIMARY KEY,operator_id TEXT NOT NULL REFERENCES operators(id),user_id TEXT NOT NULL REFERENCES users(id),
 booking_id TEXT NOT NULL,booking_kind TEXT NOT NULL CHECK(booking_kind IN('standard','custom')),service_key TEXT NOT NULL,
 rating INTEGER NOT NULL CHECK(typeof(rating)='integer' AND rating BETWEEN 1 AND 5),comment TEXT NOT NULL DEFAULT '' CHECK(length(comment)<=1000),
 author_label TEXT NOT NULL CHECK(length(author_label) BETWEEN 1 AND 40),
 simulated INTEGER NOT NULL DEFAULT 1 CHECK(simulated IN(0,1)),
 status TEXT NOT NULL DEFAULT 'visible' CHECK(status IN('visible','hidden')),reply TEXT NOT NULL DEFAULT '' CHECK(length(reply)<=1000),
 revision INTEGER NOT NULL DEFAULT 1,last_nonce TEXT NOT NULL,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 reply_at TEXT,moderation_reason TEXT NOT NULL DEFAULT '',UNIQUE(user_id,service_key)
);
CREATE INDEX standard_reviews_public ON standard_reviews(operator_id,status,created_at,id);
CREATE TRIGGER standard_review_verified BEFORE INSERT ON standard_reviews
WHEN NOT EXISTS(SELECT 1 FROM standard_review_eligibility e WHERE e.user_id=NEW.user_id AND e.operator_id=NEW.operator_id
 AND e.booking_id=NEW.booking_id AND e.booking_kind=NEW.booking_kind AND e.service_key=NEW.service_key)
 OR EXISTS(SELECT 1 FROM memberships WHERE user_id=NEW.user_id AND operator_id=NEW.operator_id)
 OR NEW.simulated<>1 OR NEW.status<>'visible' OR NEW.reply<>''
BEGIN SELECT RAISE(ABORT,'review_not_eligible'); END;
CREATE TRIGGER standard_review_immutable BEFORE UPDATE OF operator_id,user_id,booking_id,booking_kind,service_key,rating,comment,author_label,created_at,simulated ON standard_reviews
BEGIN SELECT RAISE(ABORT,'review_immutable'); END;
CREATE TABLE standard_review_reports (
 id TEXT PRIMARY KEY,review_id TEXT NOT NULL REFERENCES standard_reviews(id),reporter_id TEXT NOT NULL REFERENCES users(id),
 reason TEXT NOT NULL CHECK(length(reason) BETWEEN 5 AND 500),created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(review_id,reporter_id)
);
INSERT OR IGNORE INTO schema_migrations(version) VALUES('0021_public_profiles_reviews');
