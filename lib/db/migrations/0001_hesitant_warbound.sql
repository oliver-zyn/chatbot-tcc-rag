ALTER TABLE "User" RENAME TO "users";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "User_email_unique";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");