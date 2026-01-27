import { create } from 'zustand';

interface SidebarStore {
    isSidebarOpen: boolean;
    isCollapsed: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    toggleSidebar: () => void;
    toggleCollapse: () => void;
}

export const useSidebarStore = create<SidebarStore>((set) => ({
    isSidebarOpen: true,
    isCollapsed: false,
    setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
