import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import { Label } from "@/komponen/ui/label";
import { useToast } from "@/komponen/ui/use-toast";

import { AuthFormError } from "./AuthFormError";
import { authApi } from "@/fitur/autentikasi/api/authApi";

const registerSchema = z
  .object({
    fullName: z.string().min(3, "Nama lengkap minimal terdiri dari 3 karakter"),
    email: z.string().email("Alamat email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal terdiri dari 8 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const clearServerError = () => {
    if (serverError) setServerError(null);
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setServerError(null);

      await authApi.register({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      toast({
        title: "Registrasi Berhasil",
        description: "Silakan cek email Anda untuk verifikasi.",
      });
      navigate("/login");
    } catch (error: any) {
      setServerError(error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AuthFormError message={serverError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm">
            Nama Lengkap
          </Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            {...register("fullName", { onChange: clearServerError })}
            className={`${errors.fullName || serverError ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive font-medium">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">
            Alamat Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="contoh@email.com"
            {...register("email", { onChange: clearServerError })}
            className={`${errors.email || serverError ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">
              Kata Sandi
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password", { onChange: clearServerError })}
                className={`pr-8 ${errors.password || serverError ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm">
              Konfirmasi
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              {...register("confirmPassword", { onChange: clearServerError })}
              className={`${errors.confirmPassword || serverError ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full text-sm shadow-sm hover:shadow-md transition-all mt-2"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Daftar Akun Baru
        </Button>
      </form>

      <div className="text-center text-sm">
        Sudah punya akun?{" "}
        <Link
          to="/login"
          className="font-semibold text-primary hover:underline"
        >
          Masuk
        </Link>
      </div>
    </div>
  );
};
