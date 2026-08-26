import { useState } from "react";
import { LayoutDashboard, CalendarRange, MessageSquare, Settings, ChevronsRight, LogOut } from "lucide-react";

const NAV = [
    { title: "Dashboard", Icon: LayoutDashboard },
    { title: "Training Plan", Icon: CalendarRange },
    { title: "AI Coach", Icon: MessageSquare },
    { title: "Settings", Icon: Settings },
];

export default function Sidebar({ selected, setSelected }) {
    const [open, setOpen] = useState(true);

    const handleLogout = async () => {
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include"
            });
        } finally {
            window.location.href = "/";
        }
    };

     const handleSync = async () => {
        console.log("Syncing data...");
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/activities/sync`, {
                method: "POST",
                credentials: "include"
            });

            if (!response.ok) {
                throw new Error("Failed to sync data");
            }

            const result = await response.json();
            console.log("Sync result:", result);

        } catch (error) {
            console.error("Error syncing data:", error);
        } 
    };

    return (
        <nav className={`relative flex h-screen shrink-0 flex-col border-r border-white/[0.06] bg-[#0A0A0A] transition-all duration-300 ${open ? "w-64" : "w-16"}`}>
            <div className="flex items-center gap-2 px-5 py-5">
                <div className="grid size-8 shrink-0 place-content-center border border-white/20 text-sm font-bold text-white">E</div>
                {open && <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">Endurio</span>}
            </div>

            <div className="flex-1 space-y-1 px-2">
                {NAV.map(({ title, Icon }) => {
                    const isSelected = selected === title;
                    return (
                        <button
                            key={title}
                            onClick={() => setSelected(title)}
                            className={`flex h-11 w-full items-center gap-3 px-3 text-sm transition ${
                                isSelected ? "border-l-2 border-white bg-white/[0.06] text-white" : "text-white/40 hover:bg-white/[0.03] hover:text-white/70"
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {open && <span className="truncate">{title}</span>}
                        </button>
                    );
                })}
            </div>

            <div className="border-t border-white/[0.06] p-2">
                <button onClick={handleLogout} className={`flex h-11 w-full items-center gap-3 px-3 text-sm text-white/40 transition hover:text-white ${!open && "justify-center"}`}>
                    <LogOut className="h-4 w-4 shrink-0" />
                    {open && <span>Logout</span>}
                </button>

                <button onClick={handleSync} className={`flex h-11 w-full items-center gap-3 px-3 text-sm text-white/40 transition hover:text-white ${!open && "justify-center"}`}>
                    <CalendarRange className="h-4 w-4 shrink-0" />
                    {open && <span>Sync Data</span>}
                </button>

                <button onClick={() => setOpen(!open)} className="flex h-11 w-full items-center justify-center text-white/40 transition hover:text-white">
                    <ChevronsRight className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                </button>
            </div>
        </nav>
    );
}
