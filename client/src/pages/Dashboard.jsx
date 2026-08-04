import { useState, useEffect } from "react";
import { Activity, Clock, Gauge, Flame, TrendingUp, Trophy, Timer, Zap } from "lucide-react";

import Sidebar from "../components/ui/Sidebar";

export default function Dashboard() {
    const [selected, setSelected] = useState("Dashboard");

    const [data, setData] = useState(null);
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/stats/dashboard`, {
                    credentials: "include"
                });

                if(!response.ok) throw new Error("Network Error");

                const result = await response.json();
                setData(result);

                console.log(result);

            } catch (error) {
                console.error(error);
            }
        };

        fetchDashboardData();

    }, []);

    return (
        <div className="flex min-h-screen bg-[#0B0B0B] text-white">
            <Sidebar selected={selected} setSelected={setSelected} />

            <main className="flex-1 overflow-auto p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="mt-1 text-sm text-white/40">Here's how your training looks</p>
                </header>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Activity} label="Runs" value={data?.activitySummary[0]?.total_runs ?? "-"} hint="last 30 days" />
                    <StatCard icon={TrendingUp} label="Distance" value={data?.activitySummary[0]?.total_distance ?? "-"} hint="last 30 days" />
                    <StatCard icon={Clock} label="Time" value={data?.activitySummary[0]?.total_hours ?? "-"} hint="last 30 days" />
                    <StatCard icon={Gauge} label="Avg Pace" value={data?.activitySummary[0]?.avg_pace_per_km ?? "-"} hint="last 30 days" />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={Flame} label="Longest Run" value="16.2 km" hint="last 4 weeks" />
                    <StatCard icon={Timer} label="Fastest 5K" value="24:30" hint="12 Jun" />
                    <StatCard icon={Zap} label="Fastest 10K" value="51:12" hint="20 May" />
                    <StatCard icon={Trophy} label="Runs / Week" value="2" hint="last 4 weeks" />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <section className="border border-white/[0.06] bg-[#0A0A0A] p-6 lg:col-span-2">
                        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/40">Weekly Mileage</h2>
                        <div className="flex items-end gap-3">
                            {[14.9, 18.8, 22.4, 14.0, 24.1, 19.5, 12.3].map((km, i) => (
                                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                                    <span className="text-xs text-white/40">{km}</span>
                                    <div className="w-full bg-white/80" style={{ height: `${(km / 24.1) * 120}px` }} />
                                    <span className="text-[10px] text-white/25">W{i + 1}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="border border-white/[0.06] bg-[#0A0A0A] p-6">
                        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-white/40">Recent Runs</h2>
                        <ul className="space-y-3">
                            {[
                                { date: "02 Aug", km: "12.4", min: "82" },
                                { date: "31 Jul", km: "8.2", min: "52" },
                                { date: "28 Jul", km: "15.0", min: "96" },
                                { date: "25 Jul", km: "6.8", min: "42" },
                                { date: "21 Jul", km: "10.1", min: "64" },
                            ].map((run, i) => (
                                <li key={i} className="flex items-center justify-between border-b border-white/[0.04] pb-3 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium">{run.date}</p>
                                        <p className="text-xs text-white/40">{run.km} km</p>
                                    </div>
                                    <span className="text-xs text-white/40">{run.min} min</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </main>
        </div>
    );
}

const StatCard = ({ icon: Icon, label, value, hint }) => (
    <div className="border border-white/[0.06] bg-[#0A0A0A] p-6">
        <div className="mb-4 flex items-center justify-between">
            <Icon className="h-4 w-4 text-white/40" />
        </div>
        <p className="text-sm text-white/40">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-white/25">{hint}</p>
    </div>
);
