import { useState, useEffect } from "react";
import { Activity, Clock, Gauge, Flame, TrendingUp, Trophy, Timer, Zap } from "lucide-react";

// components
import Sidebar from "../components/ui/Sidebar";

const formatPace = (timeStr) => {
    if (!timeStr) return "-";
    const decimalMinutes = parseFloat(timeStr);
    const totalSeconds = Math.floor(decimalMinutes * 60);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return hours >= 1 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
};

const formatDate = (isoString) => {

    if (!isoString) return "-";
    const date = new Date(isoString);

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    return formattedDate;
};

export default function Dashboard() {

    const [selected, setSelected] = useState("Dashboard");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [recentRuns, setRecentRuns] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, runsRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/stats/dashboard`, { credentials: "include" }),
                    fetch(`${import.meta.env.VITE_API_URL}/activities?limit=5`, { credentials: "include" })
                ]);

                const [stats, runs] = await Promise.all([statsRes.json(), runsRes.json()]);

                setData(stats);
                setRecentRuns(runs.activities);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
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

                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={Activity} label="Runs" value={data?.activitySummary[0]?.total_runs ?? "-"} hint="last 30 days" />
                    )}

                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={TrendingUp} label="Distance" value={data?.activitySummary[0]?.total_distance ?? "-"} hint="last 30 days" />
                    )}

                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={Clock} label="Time" value={data?.activitySummary[0]?.total_hours ?? "-"} hint="last 30 days" />
                    )}


                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={Gauge} label="Avg Pace" value={data?.activitySummary[0]?.avg_pace_per_km ?? "-"} hint="last 30 days" />
                    )}


                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">


                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={Flame} label="Longest Run" value={data?.longestRun[0]?.distance ?? "-"} hint="last 4 weeks" />
                    )}

                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={Timer} label="Fastest 5K" value={formatPace(data?.fastest5K[0]?.round)} hint={formatDate(data?.fastest5K[0]?.start_date_local)} />
                    )}

                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={Zap} label="Fastest 10K" value={formatPace(data?.fastest10K[0]?.round)} hint={formatDate(data?.fastest10K[0]?.start_date_local)} />
                    )}


                    {loading ? (
                        <CardSkeleton />
                    ) : (
                        <StatCard icon={Trophy} label="Runs / Week" value={data?.runningConsistency[0]?.count} hint="last 4 weeks" />
                    )}

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
                            {
                                loading ? (
                                    <>
                                        {[...Array(5)].map((_, i) => (
                                            <li key={i} className="flex items-center justify-between border-b border-white/[0.04] pb-3 last:border-0">
                                                <div>
                                                    <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
                                                    <div className="mt-1 h-3 w-12 animate-pulse rounded bg-white/10" />
                                                </div>
                                                <div className="h-3 w-8 animate-pulse rounded bg-white/10" />
                                            </li>
                                        ))}
                                    </>
                                ) : (
                                    recentRuns?.map((run, i) => (
                                        <li key={i} className="flex items-center justify-between border-b border-white/[0.04] pb-3 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium">{formatDate(run.start_date_local)}</p>
                                                <p className="text-xs text-white/40">{(run.distance / 1000).toFixed(2)} km</p>
                                            </div>
                                            <span className="text-xs text-white/40">{Math.round(run.moving_time / 60)} min</span>
                                        </li>
                                    ))
                                )
                            }
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

const CardSkeleton = () => (
    <div className="border border-white/[0.06] bg-[#0A0A0A] p-6">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-4 w-4 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
        <div className="mt-3 h-8 w-24 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-white/10" />
    </div>
);
