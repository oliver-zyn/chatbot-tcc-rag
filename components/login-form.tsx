"use client";

import { useFormState } from "react-dom";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type LoginActionState, login } from "@/app/(auth)/actions";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useFormState<LoginActionState, FormData>(
    login,
    {
      status: "idle",
    }
  );

  useEffect(() => {
    if (state.status === "failed") {
      setIsSubmitting(false);
      toast.error(state.message || "Credenciais inválidas");
    } else if (state.status === "invalid_data") {
      setIsSubmitting(false);
      toast.error(state.message || "Dados inválidos");
    } else if (state.status === "success") {
      toast.success("Login realizado com sucesso!");
      startTransition(() => {
        router.push("/");
        router.refresh();
      });
    }
  }, [state, router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Email inválido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    } else if (password.length < 8) {
      newErrors.password = "Senha deve ter no mínimo 8 caracteres";
    }

    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
  };

  const isLoading = isSubmitting || isPending;

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form action={formAction} onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Brain className="size-7 text-primary" />
              </div>
            </div>
            <h1 className="text-xl font-bold">Bem-vindo ao Synapse</h1>
            <div className="text-center text-sm text-muted-foreground">
              Sistema inteligente de consulta a documentos
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                disabled={isLoading}
                className={errors.email ? "border-destructive" : ""}
                onChange={() => setErrors(prev => ({ ...prev, email: undefined }))}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                className={errors.password ? "border-destructive" : ""}
                onChange={() => setErrors(prev => ({ ...prev, password: undefined }))}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
