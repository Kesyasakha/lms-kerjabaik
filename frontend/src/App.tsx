import { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "./router";
import { useAuthStore } from "@/fitur/autentikasi/stores/authStore";
import { queryClient } from "@/pustaka/queryClient";

import { Toaster } from "@/komponen/ui/toaster";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRouter />
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
