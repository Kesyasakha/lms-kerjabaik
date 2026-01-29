import { ReactNode } from "react";
import { GraduationCap } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  headerTitle: string;
  headerSubtitle: string;
}

import { AuroraBackground } from "@/komponen/ui/aurora-background";

export const AuthLayout = ({
  children,
  headerTitle,
  headerSubtitle,
}: AuthLayoutProps) => {
  return (
    <AuroraBackground showRadialGradient className="min-h-screen w-full flex items-center justify-center p-4">
      {/* Main Card */}
      <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-10 border border-white/50 relative z-10 transition-all duration-300">

        {/* Header Icon */}
        <div className="flex flex-col items-center gap-6 mb-8 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-lg shadow-gray-200/50 flex items-center justify-center border border-white/60">
            {/* Using GraduationCap as the brand icon */}
            <div className="bg-gray-900 text-white p-2 rounded-lg">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {headerTitle}
            </h1>
            <p className="text-sm font-medium text-gray-500 max-w-[280px] mx-auto leading-relaxed">
              {headerSubtitle}
            </p>
          </div>
        </div>

        {/* Content (Form) */}
        <div>
          {children}
        </div>

      </div>

      {/* Footer Info */}
      <div className="absolute bottom-6 text-center w-full text-xs font-semibold text-gray-400">
        &copy; {new Date().getFullYear()} Kerjabaik Academy
      </div>
    </AuroraBackground>
  );
};
