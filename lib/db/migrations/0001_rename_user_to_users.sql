-- Rename table User to users
ALTER TABLE "User" RENAME TO "users";

-- Rename constraint
ALTER TABLE "users" RENAME CONSTRAINT "User_email_unique" TO "users_email_unique";
