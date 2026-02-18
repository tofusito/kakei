CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
