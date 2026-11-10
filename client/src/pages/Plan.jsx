import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarRange, X } from "lucide-react";

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

const formatWeekRange = (weekRange) => {
    if (!weekRange?.start_date || !weekRange?.end_date) return "";

    const formatter = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC"
    });

    return formatter.formatRange(new Date(weekRange.start_date), new Date(weekRange.end_date));
};

function Plan() {

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeWeek, setActiveWeek] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);
    const [panelClosing, setPanelClosing] = useState(false);
    const triggerRef = useRef(null);
    const closeTimer = useRef(null);

    const openSession = (day, element) => {
        window.clearTimeout(closeTimer.current);
        triggerRef.current = element;
        setPanelClosing(false);
        setSelectedDay(day);
    };

    const closeSession = () => {
        if (panelClosing) return;

        setPanelClosing(true);

        closeTimer.current = window.setTimeout(() => {
            setSelectedDay(null);
            setPanelClosing(false);
            triggerRef.current?.focus();
        }, 180);
    };

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
    const todayKey = new Date().toLocaleDateString("en-CA");

    const weekSummary = week?.weekly_summary && typeof week.weekly_summary === "object" ? week.weekly_summary : {};
    const weekNotes = typeof week?.weekly_summary === "string"
        ? week.weekly_summary
        : weekSummary.recovery_notes ?? weekSummary.notes;

    const weekMetrics = [
        { label: "Distance", value: week?.target_distance_km, unit: "km" },
        { label: "Time", value: weekSummary.total_duration_minutes, unit: "min" },
        { label: "Sessions", value: week?.training_days, unit: null }
    ].filter(({ value }) => value !== undefined && value !== null);

    return (
        <div className="flex min-h-screen bg-[#0B0B0B] text-white">
            <Sidebar />

            <main className={`no-scrollbar flex-1 p-8 ${selectedDay ? "overflow-hidden" : "overflow-auto"}`}>
                <header className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">Training Plan</h1>
                    <p className="mt-1 text-sm text-white/40">Your week-by-week schedule</p>
                </header>

                {loading && (
                    <div className="animate-pulse">
                        <div className="flex gap-1 border-b border-white/[0.08] pb-3">
                            {Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="h-9 w-11 bg-white/[0.05]" />
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
                            <div className="space-y-2">
                                <div className="h-2.5 w-20 bg-white/[0.05]" />
                                <div className="h-5 w-24 bg-white/[0.05]" />
                                <div className="h-3 w-28 bg-white/[0.05]" />
                            </div>
                            <div className="flex gap-6">
                                {[0, 1, 2].map((index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="h-5 w-14 bg-white/[0.05]" />
                                        <div className="h-2.5 w-16 bg-white/[0.05]" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="h-40 border border-white/[0.06] bg-[#0A0A0A]" />
                            ))}
                        </div>
                    </div>
                )}

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
                            Generate one and it will be built around your goal, your weekly schedule
                            and your recent running.
                        </p>
                        <button
                            disabled
                            className="mt-6 border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Generate plan
                        </button>
                        <p className="mt-3 text-[11px] text-white/25">Takes about a minute.</p>
                    </section>
                )}

                {!loading && !error && week && (
                    <>
                        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-white/[0.08]">
                            {weeks.map((weekItem, index) => {
                                const isActive = index === activeWeek;

                                return (
                                    <button
                                        key={weekItem.week_number ?? index}
                                        onClick={() => {
                                            setActiveWeek(index);
                                            setSelectedDay(null);
                                            setPanelClosing(false);
                                        }}
                                        aria-pressed={isActive}
                                        className="group relative shrink-0 cursor-pointer px-4 pb-3 pt-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00]"
                                    >
                                        <span className="block text-[10px] uppercase tracking-[0.18em] text-white/35">WK</span>
                                        <span className={`block text-2xl font-medium tabular-nums transition-colors duration-150 ${
                                            isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                                        }`}>
                                            {weekItem.week_number ?? index + 1}
                                        </span>
                                        {isActive ? (
                                            <span className="rail-line absolute inset-x-0 -bottom-px h-px bg-[#CCFF00]" />
                                        ) : (
                                            <span className="absolute inset-x-0 -bottom-px h-px bg-white/20 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div key={activeWeek} className="week-in">
                            <div className="mt-6 border-b border-white/[0.06] pb-5">
                                <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">
                                            Week {String(week.week_number ?? activeWeek + 1).padStart(2, "0")}
                                        </p>
                                        {week.phase && <p className="mt-1.5 text-lg font-medium">{week.phase}</p>}
                                        <p className="mt-1 text-xs text-white/40">
                                            {formatWeekRange(week.week_range)}
                                        </p>
                                    </div>

                                    <div className="flex items-end">
                                        {weekMetrics.map(({ label, value, unit }, index) => (
                                            <div key={label} className={index > 0 ? "border-l border-white/[0.08] pl-6 ml-6" : ""}>
                                                <p className="text-xl font-medium leading-none tabular-nums">
                                                    {value}
                                                    {unit && <span className="ml-1 text-[11px] font-normal text-white/40">{unit}</span>}
                                                </p>
                                                <p className="mt-1.5 text-[10px] uppercase tracking-[0.15em] text-white/30">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {weekNotes && <p className="mt-4 max-w-2xl text-xs leading-relaxed text-white/35">{weekNotes}</p>}
                            </div>

                            <div className="mt-6 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {(week.days || []).map((day) => (
                                    <DayCard
                                        key={day.date}
                                        day={day}
                                        isToday={day.date === todayKey}
                                        onSelect={(element) => openSession(day, element)}
                                    />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </main>

            {selectedDay && <SessionPanel day={selectedDay} closing={panelClosing} onClose={closeSession} />}
        </div>
    );
};

const DayCard = ({ day, isToday, onSelect }) => {
    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(event.currentTarget);
        }
    };

    if (day.rest) {
        return (
            <article
                onClick={(event) => onSelect(event.currentTarget)}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
                aria-label={`Open ${day.day} session details`}
                className={`group cursor-pointer border border-white/[0.05] bg-white/[0.015] px-4 py-3 transition-colors duration-150 hover:border-white/[0.10] hover:bg-white/[0.03] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00] ${isToday ? "border-l-2 border-l-[#CCFF00]" : ""}`}
            >
                <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{day.day}</p>
                    <span className="flex items-center gap-1.5">
                        <p className="text-[10px] text-white/25">{formatDate(day.date)}</p>
                        <ArrowUpRight className="h-3 w-3 text-white/30 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                    </span>
                </div>

                <p className="mt-1 text-[13px] font-medium text-white/30">{day.workout_type}</p>
                {day.notes && <p className="mt-1 text-[11px] leading-relaxed text-white/25">{day.notes}</p>}
            </article>
        );
    }

    return (
        <article
            onClick={(event) => onSelect(event.currentTarget)}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label={`Open ${day.day} session details`}
            className={`group cursor-pointer border border-white/[0.08] bg-[#0A0A0A] p-4 transition-colors duration-150 hover:border-white/[0.16] hover:bg-[#0E0E0E] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00] ${isToday ? "border-l-2 border-l-[#CCFF00]" : ""}`}
        >
            <div className="flex items-baseline justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{day.day}</p>
                <span className="flex items-center gap-1.5">
                    <p className="text-[10px] text-white/25">{formatDate(day.date)}</p>
                    <ArrowUpRight className="h-3 w-3 text-white/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                </span>
            </div>

            <p className="mt-3 text-[13px] font-medium text-white">{day.workout_type}</p>

            <p className="mt-1 text-3xl font-medium tabular-nums tracking-tight">
                {day.distance_km}
                <span className="ml-1 text-xs font-normal text-white/40">km</span>
            </p>

            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/40">
                {day.duration_minutes ? <span>{day.duration_minutes} min</span> : null}
                {day.pace_readable ? <span>{day.pace_readable}</span> : null}
                {day.intensity_zone ? <span>{day.intensity_zone}</span> : null}
            </div>

            <MainSet mainSet={day.main_set} />
        </article>
    );
};

const humanize = (key) => key.replaceAll("_", " ");

const asMinutes = (value) => (typeof value === "number" ? `${value} min` : String(value));

const asMeters = (value) => {
    if (typeof value !== "number") return String(value);

    return value >= 1000 && value % 1000 === 0 ? `${value / 1000} km` : `${value} m`;
};

const asValue = (key, value) => {
    if (typeof value !== "number") return String(value);
    if (key.endsWith("_minutes")) return `${value} min`;
    if (key.endsWith("_seconds") || key.endsWith("_sec")) return `${value}s`;
    if (key.endsWith("_m")) return asMeters(value);

    return String(value);
};

const labelFor = (key) => humanize(key.replace(/_(minutes|min|seconds|sec|m|km)$/, ""));

const parseMainSet = (mainSet) => {
    if (typeof mainSet === "string") {
        return { headline: mainSet, recovery: null, steps: [] };
    }

    const entries = Object.entries(mainSet).filter(([, value]) =>
        typeof value === "string" || typeof value === "number"
    );

    if (entries.length === 0) return null;

    const used = new Set();

    const read = (test) => {
        const hit = entries.find(([key]) => !used.has(key) && test(key));

        if (!hit) return null;

        used.add(hit[0]);

        return hit[1];
    };

    const repetitions = read((key) => key === "repetitions" || key === "reps" || key === "sets");
    const distance = read((key) => key.endsWith("_distance_m"));
    const minutes = read((key) => /^(work|run|effort|interval|segment)_minutes$/.test(key));
    const work = read((key) => key === "work" || key === "effort");
    const easy = read((key) => /^easy(_run)?_minutes$/.test(key));
    const strides = read((key) => key === "strides");
    const strideSeconds = read((key) => key === "stride_duration_sec");
    const recovery = read((key) => key.includes("recovery"));
    const warmup = read((key) => /warm.?up/.test(key));
    const cooldown = read((key) => /cool.?down/.test(key));

    const headline = [];

    if (repetitions && distance) {
        headline.push(`${repetitions} × ${asMeters(distance)}`);
    } else if (repetitions && minutes) {
        headline.push(`${repetitions} × ${asMinutes(minutes)}`);
    } else if (repetitions && work) {
        headline.push(`${repetitions} × ${work}`);
    } else if (work) {
        headline.push(String(work));
    } else if (minutes) {
        headline.push(asMinutes(minutes));
    }

    if (easy) headline.push(`${asMinutes(easy)} easy`);

    if (strides) {
        headline.push(strideSeconds ? `${strides} × ${strideSeconds}s strides` : `${strides} strides`);
    }

    const steps = [];

    if (warmup) steps.push({ label: "Warm-up", value: asMinutes(warmup) });
    if (cooldown) steps.push({ label: "Cool-down", value: asMinutes(cooldown) });

    entries.forEach(([key, value]) => {
        if (!used.has(key)) steps.push({ label: labelFor(key), value: asValue(key, value) });
    });

    if (headline.length === 0) {
        const [first, ...rest] = steps;
        if (first) headline.push(`${first.label} ${first.value}`);
        steps.length = 0;
        steps.push(...rest);
    }

    return {
        headline: headline.join(" + ") || null,
        recovery: recovery === null ? null : asMinutes(recovery),
        steps
    };
};

const MainSet = ({ mainSet }) => {
    if (!mainSet) return null;

    const parsed = parseMainSet(mainSet);

    if (!parsed) return null;

    const { headline, recovery, steps } = parsed;

    if (!headline && !recovery && steps.length === 0) return null;

    return (
        <div className="mt-3 border-t border-white/[0.06] pt-2.5">
            {headline && (
                <p className="text-[13px] font-medium leading-snug tabular-nums text-white/85">{headline}</p>
            )}

            {recovery && (
                <p className="mt-1 text-[11px] leading-relaxed text-white/40">
                    <span className="text-white/25">Recovery</span> {recovery}
                </p>
            )}

            {steps.length > 0 && (
                <p className="mt-1 text-[10px] leading-relaxed text-white/30">
                    {steps.map(({ label, value }) => `${label} ${value}`).join(" · ")}
                </p>
            )}
        </div>
    );
};

const SessionPanel = ({ day, closing, onClose }) => {
    const panelRef = useRef(null);
    const parsed = day.main_set ? parseMainSet(day.main_set) : null;

    const metrics = [
        { label: "Distance", value: day.distance_km, unit: "km" },
        { label: "Duration", value: day.duration_minutes, unit: "min" },
        { label: "Pace", value: day.pace_readable, unit: null },
        { label: "Zone", value: day.intensity_zone, unit: null }
    ].filter(({ value }) => value !== undefined && value !== null && value !== "");

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (event.key !== "Tab" || !panelRef.current) return;

            const focusable = panelRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className={`absolute inset-0 bg-black/60 ${closing ? "panel-backdrop-out" : "panel-backdrop"}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <section
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="session-title"
                className={`no-scrollbar relative h-full w-full max-w-md overflow-y-auto border-l border-white/[0.08] bg-[#0A0A0A] p-6 ${closing ? "panel-out" : "panel-in"}`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                            {day.day}
                            {formatDate(day.date) && ` · ${formatDate(day.date)}`}
                        </p>
                        <h2 id="session-title" className="mt-2 text-2xl font-medium tracking-tight">{day.workout_type}</h2>
                        {day.description && (
                            <p className="mt-1.5 text-sm leading-relaxed text-white/40">{day.description}</p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        autoFocus
                        aria-label="Close session details"
                        className="grid size-8 shrink-0 cursor-pointer place-content-center border border-white/[0.08] text-white/40 transition-colors duration-150 hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {metrics.length > 0 && (
                    <div className="mt-6 grid grid-cols-2 gap-px border border-white/[0.06] bg-white/[0.06]">
                        {metrics.map(({ label, value, unit }) => (
                            <div key={label} className="bg-[#0A0A0A] p-4">
                                <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">{label}</p>
                                <p className="mt-1.5 text-xl font-medium leading-none tabular-nums">
                                    {value}
                                    {unit && <span className="ml-1 text-[11px] font-normal text-white/40">{unit}</span>}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {parsed && (
                    <div className="mt-6">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Session</p>

                        {parsed.headline && (
                            <p className="mt-2 text-lg font-medium leading-snug tabular-nums">{parsed.headline}</p>
                        )}

                        {(parsed.recovery || parsed.steps.length > 0) && (
                            <dl className="mt-3 space-y-1.5">
                                {parsed.recovery && (
                                    <div className="flex gap-4">
                                        <dt className="w-20 shrink-0 text-xs text-white/30">Recovery</dt>
                                        <dd className="text-xs leading-relaxed text-white/55">{parsed.recovery}</dd>
                                    </div>
                                )}
                                {parsed.steps.map(({ label, value }) => (
                                    <div key={`${label}-${value}`} className="flex gap-4">
                                        <dt className="w-20 shrink-0 text-xs capitalize text-white/30">{label}</dt>
                                        <dd className="text-xs leading-relaxed text-white/55">{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>
                )}

                {day.notes && (
                    <div className="mt-6 border-t border-white/[0.06] pt-4">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/30">Notes</p>
                        <p className="mt-2 text-[13px] leading-relaxed text-white/60">{day.notes}</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Plan;
