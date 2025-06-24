CREATE INDEX "profiles_full_name_idx" ON "profiles" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "profiles_email_idx" ON "profiles" USING btree ("email");--> statement-breakpoint
CREATE INDEX "profiles_username_full_name_idx" ON "profiles" USING btree ("username","full_name");
