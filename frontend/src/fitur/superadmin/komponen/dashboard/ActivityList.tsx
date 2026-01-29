import { formatTanggal } from "@/pustaka/utils";
import type { AuditLogWithUser } from "../../tipe/auditLog.types";
import { motion } from "framer-motion";

interface ActivityListProps {
    logs: AuditLogWithUser[];
    isLoading?: boolean;
}

export function ActivityList({ logs, isLoading }: ActivityListProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                        <div className="flex flex-col items-center">
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-200"></div>
                            <div className="w-px h-full bg-gray-100 my-1"></div>
                        </div>
                        <div className="flex-1 space-y-2 pb-4">
                            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-8 text-xs text-gray-400">
                Tidak ada aktivitas tercatat
            </div>
        )
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 },
    };

    return (
        <motion.div
            className="space-y-0"
            variants={container}
            initial="hidden"
            animate="show"
        >
            {logs.map((log, i) => {
                const isLast = i === logs.length - 1;
                return (
                    <motion.div key={log.id} variants={item} className="flex gap-3 group">
                        <div className="flex flex-col items-center shrink-0 mt-[3px]">
                            <div className="w-2 h-2 min-w-[8px] min-h-[8px] rounded-full bg-violet-400 ring-4 ring-violet-50 group-hover:ring-violet-100 transition-all box-content"></div>
                            {!isLast && <div className="w-px h-full bg-gray-200 my-1"></div>}
                        </div>
                        <div className="pb-6">
                            <p className="text-[10px] text-gray-400 font-medium mb-0.5 flex items-center h-4">
                                {formatTanggal(log.created_at)} • {new Date(log.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                                <span className="font-bold">{log.nama_pengguna}</span> {log.aksi.toLowerCase()} {log.tipe_sumber_daya.toLowerCase()}
                            </p>
                            {log.nama_lembaga && (
                                <p className="text-[10px] text-gray-500 mt-0.5 truncate max-w-[200px]">
                                    {log.nama_lembaga}
                                </p>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}
