import { TrendUp, Icon } from 'iconsax-react';
import { LucideIcon } from 'lucide-react';
import { motion } from "framer-motion";

interface StatCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: Icon | LucideIcon;
    color: string;
    trend?: string;
}

export function StatCard({ title, value, subtext, icon: Icon, color, trend = "+12.5%" }: StatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow duration-200 cursor-pointer"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-xl ${color}`}>
                    <Icon size={20} className="text-white" variant="Bold" />
                </div>
                <span className="flex items-center text-[10px] font-medium text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
                    <TrendUp size={12} className="mr-1" /> {trend}
                </span>
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">{title}</p>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{value}</h3>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{subtext}</p>
            </div>
        </motion.div>
    );
}
