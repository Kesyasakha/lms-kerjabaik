import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

import { Button } from "@/komponen/ui/button";
import { Input } from "@/komponen/ui/input";
import { useAuthStore } from "@/fitur/autentikasi/stores/authStore";
import { pemberitahuan } from "@/pustaka/pemberitahuan"; // Konsisten pakai notiflix

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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
      pemberitahuan.sukses("Selamat datang kembali!");
      navigate("/dashboard");
    } catch (error: any) {
      const errorMessage = error.message === "Invalid login credentials"
        ? "Email atau kata sandi tidak ditemukan."
        : error.message || "Terjadi kesalahan saat masuk.";

      setServerError(errorMessage);
    }
  };

  const clearServerError = () => {
    if (serverError) setServerError(null);
  };

  return (
    <div className="space-y-6">
      <AuthFormError message={serverError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors">
              <Mail className="h-5 w-5" />
            </div>
            <Input
              id="email"
              type="email"
              placeholder="Alamat Email"
              {...register("email", { onChange: clearServerError })}
              className={`pl-10 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 transition-all font-medium placeholder:text-gray-400 ${errors.email ? "border-red-200 bg-red-50 focus:ring-red-100" : ""}`}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 font-bold ml-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Kata Sandi"
              {...register("password", { onChange: clearServerError })}
              className={`pl-10 pr-10 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:border-gray-200 focus:ring-2 focus:ring-gray-100 transition-all font-medium placeholder:text-gray-400 ${errors.password ? "border-red-200 bg-red-50 focus:ring-red-100" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 font-bold ml-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-gray-900 text-white font-bold text-base hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-gray-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            "Masuk"
          )}
        </Button>
      </form>

    </div>
  );
};
