-- Adiciona a coluna name como nullable primeiro
ALTER TABLE "users" ADD COLUMN "name" varchar(100);

-- Preenche com valor padrão baseado no email (parte antes do @)
UPDATE "users" SET "name" = split_part("email", '@', 1) WHERE "name" IS NULL;

-- Agora torna a coluna NOT NULL
ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;