import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import { Label } from "@/komponen/ui/label";
import { useAuthStore } from "@/fitur/autentikasi/stores/authStore";
import { useToast } from "@/komponen/ui/use-toast";

import { AuthFormError } from "./AuthFormError";

const loginSchema = z.object({
  email: z.string().email("Alamat email tidak valid"),
  password: z.string().min(1, "Kata sandi harus diisi"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage = error.message === "Invalid login credentials"
        ? "Email atau kata sandi Anda salah. Silakan periksa kembali."
        : error.message || "Terjadi kesalahan saat masuk. Silakan coba lagi.";

      setServerError(errorMessage);
    }
  };

  const clearServerError = () => {
    if (serverError) setServerError(null);
  };

  return (
    <div className="space-y-4">
      <AuthFormError message={serverError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm">
            Alamat Email
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="contoh@email.com"
              {...register("email", { onChange: clearServerError })}
              className={`${errors.email || serverError ? "border-destructive/50 focus-visible:ring-destructive/20" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-destructive font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm">
              Kata Sandi
            </Label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Lupa password?
            </Link>
          </div>
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

        <div className="flex items-center space-x-3 py-1">
          {/* Checkbox manually handled or standard input if shadcn checkbox missing */}
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 rounded border-2 border-muted-foreground/30 text-primary focus:ring-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
          />
          <Label
            htmlFor="remember"
            className="text-sm font-normal text-muted-foreground cursor-pointer select-none"
          >
            Ingat saya
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full text-sm shadow-sm hover:shadow-md transition-all mt-2"
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Masuk
        </Button>
      </form>



      <div className="text-center text-sm">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary hover:underline"
        >
          Daftar
        </Link>
      </div>
    </div>
  );
};
