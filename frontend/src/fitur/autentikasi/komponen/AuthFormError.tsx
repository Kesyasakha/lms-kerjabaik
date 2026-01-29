import { Alert, AlertDescription } from "@/komponen/ui/alert";
import { AlertCircle } from "lucide-react";

interface AuthFormErrorProps {
    message: string | null;
}

export const AuthFormError = ({ message }: AuthFormErrorProps) => {
    if (!message) return null;

    return (
        <Alert
            variant="destructive"
            className="bg-destructive/5 border-destructive/20 animate-in fade-in slide-in-from-top-1 duration-200 flex items-center gap-2 py-2 px-4 [&>svg]:relative [&>svg]:top-0 [&>svg]:left-0 [&>svg~*]:pl-0 [&>svg+div]:translate-y-0"
        >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <AlertDescription className="text-xs font-bold leading-none p-0">
                {message}
            </AlertDescription>
        </Alert>
    );
};
