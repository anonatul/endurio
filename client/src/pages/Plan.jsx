import { useEffect, useState } from "react";
import { CalendarRange } from "lucide-react";

import Sidebar from "../components/ui/Sidebar";

const formatDate = (isoString) => {
    if (!isoString) return "";

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC"
    });
};

function Plan() {

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeWeek, setActiveWeek] = useState(0);

    useEffect(() => {
        const loadPlan = async () => {
            setError(null);

            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/plans`, {
                    credentials: "include"
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch plan");
                };

                const data = await response.json();
                setPlan(data.plan);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadPlan();
    }, []);

    const weeks = plan?.raw_plan?.weeks || [];
    const week = weeks[activeWeek];

    return (
        <div className="flex min-h-screen bg-[#0B0B0B] text-white">
            <Sidebar />

            <main className="flex-1 overflow-auto p-8">
                <header className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Training Plan</h1>
                    <p className="mt-1 text-sm text-white/40">Your week-by-week schedule</p>
                </header>

                {loading && <p className="text-sm text-white/40">Loading plan...</p>}

                {!loading && error && (
                    <section className="border border-white/[0.08] bg-[#0A0A0A] p-8">
                        <p className="text-sm font-medium">Couldn't load your plan</p>
                        <p className="mt-1 text-sm text-white/40">{error}</p>
                    </section>
                )}

                {!loading && !error && !plan && (
                    <section className="border border-white/[0.08] bg-[#0A0A0A] p-12 text-center">
                        <CalendarRange className="mx-auto h-6 w-6 text-white/30" />
                        <h2 className="mt-4 text-lg font-bold">No active plan</h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-white/40">
                            You don't have a training plan yet. Once generated, it will be built
                            around your goal, your weekly schedule and your recent running.
                        </p>
                        <button
                            disabled
                            className="mt-6 border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Generate plan
                        </button>
                    </section>
                )}

                {!loading && !error && week && (
                    <>
                        <div className="flex gap-2 overflow-x-auto border-b border-white/[0.06] pb-3">
                            {weeks.map((weekItem, index) => (
                                <button
                                    key={weekItem.week_number ?? index}
                                    onClick={() => setActiveWeek(index)}
                                    className={`flex-shrink-0 px-4 py-2 text-sm transition ${
                                        activeWeek === index
                                            ? "border border-white bg-white text-black"
                                            : "border border-white/[0.08] text-white/50 hover:border-white/30 hover:text-white"
                                    }`}
                                >
                                    Week {weekItem.week_number ?? index + 1}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h2 className="text-xl font-semibold">
                                Week {week.week_number ?? activeWeek + 1}
                                {week.phase ? <span className="ml-2 text-white/40">· {week.phase}</span> : null}
                            </h2>

                            <WeekSummary summary={week.weekly_summary} />
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {(week.days || []).map((day) => (
                                <DayCard key={day.date} day={day} />
                            ))}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

const DayCard = ({ day }) => (
    <article className={`border p-4 ${day.rest ? "border-white/[0.05] bg-white/[0.015]" : "border-white/[0.08] bg-[#0A0A0A]"}`}>
        <div className="flex items-baseline justify-between gap-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{day.day}</p>
            <p className="text-[10px] text-white/25">{formatDate(day.date)}</p>
        </div>

        <p className={`mt-3 text-sm font-semibold ${day.rest ? "text-white/40" : "text-white"}`}>
            {day.workout_type}
        </p>

        {!day.rest && (
            <>
                <p className="mt-1 text-2xl font-bold tracking-tight">
                    {day.distance_km}
                    <span className="ml-1 text-xs font-normal text-white/40">km</span>
                </p>

                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
                    {day.duration_minutes ? <span>{day.duration_minutes} min</span> : null}
                    {day.pace_readable ? <span>{day.pace_readable}</span> : null}
                    {day.intensity_zone ? <span>{day.intensity_zone}</span> : null}
                </div>

                <MainSet mainSet={day.main_set} />
                {day.notes && <p className="mt-1 text-xs text-white/30">{day.notes}</p>}
            </>
        )}
    </article>
);

const humanize = (key) => key.replaceAll("_", " ");

const formatStat = (key, value) => {
    if (key.endsWith("_km")) return [humanize(key.slice(0, -3)), `${value} km`];
    if (key.endsWith("_minutes")) return [humanize(key.slice(0, -8)), `${value} min`];

    return [humanize(key), value];
};

const WeekSummary = ({ summary }) => {
    if (!summary) return null;

    if (typeof summary === "string") {
        return <p className="mt-2 max-w-3xl text-sm text-white/40">{summary}</p>;
    }

    const notes = summary.recovery_notes ?? summary.notes;

    const stats = Object.entries(summary).filter(([key, value]) =>
        key !== "recovery_notes" && key !== "notes" && (typeof value === "string" || typeof value === "number")
    );

    return (
        <div className="mt-3">
            {stats.length > 0 && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/40">
                    {stats.map(([key, value]) => {
                        const [label, displayValue] = formatStat(key, value);

                        return (
                            <span key={key}>
                                <span className="font-medium text-white/60">{label}</span> {displayValue}
                            </span>
                        );
                    })}
                </div>
            )}

            {notes && <p className="mt-2 max-w-3xl text-sm text-white/40">{notes}</p>}
        </div>
    );
};

const MainSet = ({ mainSet }) => {
    if (!mainSet) return null;

    if (typeof mainSet === "string") {
        return <p className="mt-2 text-xs text-white/50">{mainSet}</p>;
    }

    const entries = Object.entries(mainSet).filter(([, value]) =>
        typeof value === "string" || typeof value === "number"
    );

    if (entries.length === 0) return null;

    return (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/50">
            {entries.map(([key, value]) => (
                <span key={key}>
                    <span className="text-white/30">{humanize(key)}</span> {value}
                </span>
            ))}
        </div>
    );
};

export default Plan;
