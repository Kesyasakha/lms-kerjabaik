import { Alert, AlertDescription } from "@/komponen/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthFormErrorProps {
    message: string | null;
}

export const AuthFormError = ({ message }: AuthFormErrorProps) => {
    if (!message) return null;

    return (
        <Alert variant="destructive" className="bg-destructive/5 border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs font-medium">
                {message}
            </AlertDescription>
        </Alert>
    );
};
