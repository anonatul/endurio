import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarRange, Loader2, X } from "lucide-react";

import { AppShell } from "../components/ui/AppShell";

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

const useDialogFocus = (panelRef, onClose) => {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }

            if (event.key !== "Tab" || !panelRef.current) return;

            const focusable = Array.from(
                panelRef.current.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            ).filter((element) => !element.disabled);

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
    }, [panelRef, onClose]);
};

function Plan() {

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeWeek, setActiveWeek] = useState(0);
    const [selectedDay, setSelectedDay] = useState(null);
    const [panelClosing, setPanelClosing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateError, setGenerateError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const triggerRef = useRef(null);
    const closeTimer = useRef(null);
    const tabRefs = useRef([]);

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

    const handleGenerate = async () => {
        if (generating) return;

        setDialogOpen(false);
        setGenerating(true);
        setGenerateError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/plans`, {
                method: "POST",
                credentials: "include"
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(result.error || "Couldn't build your plan. Try again.");
            }

            setPlan(result.plan);
            setActiveWeek(0);
            setSelectedDay(null);
        } catch (error) {
            setGenerateError(error.message);
        } finally {
            setGenerating(false);
        }
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

    useEffect(() => {
        tabRefs.current[activeWeek]?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }, [activeWeek]);

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

    const firstWeekStart = weeks[0]?.week_range?.start_date;
    const lastWeekEnd = weeks[weeks.length - 1]?.week_range?.end_date;

    const weekIndex = weeks.findIndex((item) => {
        const start = item.week_range?.start_date;
        const end = item.week_range?.end_date;

        return start && end && todayKey >= start && todayKey <= end;
    });

    const currentWeekNumber = weekIndex >= 0 ? weekIndex + 1 : 1;

    const planPhase = !firstWeekStart
        ? "active"
        : todayKey < firstWeekStart
            ? "upcoming"
            : lastWeekEnd && todayKey > lastWeekEnd
                ? "complete"
                : "active";

    const daysUntilStart = firstWeekStart
        ? Math.max(0, Math.round(
            (Date.parse(`${firstWeekStart}T00:00:00Z`) - Date.parse(`${todayKey}T00:00:00Z`)) / 86400000
        ))
        : 0;

    const regenerateLabel = planPhase === "upcoming"
        ? "Replace plan"
        : planPhase === "complete"
            ? "Build next plan"
            : "Regenerate plan";

    const handleRailKeyDown = (event) => {
        const lastIndex = weeks.length - 1;
        let nextIndex = null;

        if (event.key === "ArrowRight") {
            nextIndex = activeWeek === lastIndex ? 0 : activeWeek + 1;
        } else if (event.key === "ArrowLeft") {
            nextIndex = activeWeek === 0 ? lastIndex : activeWeek - 1;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = lastIndex;
        }

        if (nextIndex === null || lastIndex < 0) return;

        event.preventDefault();
        setActiveWeek(nextIndex);
        setSelectedDay(null);
        setPanelClosing(false);

        requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
    };

    return (
        <AppShell current="/plan" tone="ink">
            <main className={`no-scrollbar flex-1 ${selectedDay || dialogOpen ? "overflow-hidden" : "overflow-auto"}`}>
                <div className="app-container p-8">
                <header className="mb-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Training Plan</h1>
                            <p className="mt-1 text-sm text-white/40">Your week-by-week schedule</p>
                        </div>

                        {!loading && !error && plan && (
                            generating ? (
                                <span className="inline-flex items-center gap-2 border border-white/[0.12] px-3 py-1.5 text-xs text-white/50">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Building your plan…
                                </span>
                            ) : (
                                <button
                                    onClick={() => setDialogOpen(true)}
                                    className={`cursor-pointer border px-3 py-1.5 text-xs transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00] ${
                                        planPhase === "active"
                                            ? "border-[#FF6B6B]/25 text-[#FF6B6B]/75 hover:border-[#FF6B6B]/60 hover:text-[#FF6B6B]"
                                            : "border-white/[0.12] text-white/60 hover:border-white/[0.25] hover:text-white"
                                    }`}
                                >
                                    {regenerateLabel}
                                </button>
                            )
                        )}
                    </div>

                    {generateError && plan && (
                        <p role="alert" className="mt-3 text-xs text-white/60">{generateError}</p>
                    )}
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
                            onClick={handleGenerate}
                            disabled={generating}
                            className="mt-6 inline-flex cursor-pointer items-center gap-2 border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition disabled:cursor-wait disabled:opacity-60"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Building your plan…
                                </>
                            ) : (
                                "Generate plan"
                            )}
                        </button>

                        {generating && (
                            <span className="mx-auto mt-4 block h-px w-48 overflow-hidden bg-white/10">
                                <span className="loading-bar block h-px w-1/3 bg-[#CCFF00]" />
                            </span>
                        )}

                        {generateError ? (
                            <p role="alert" className="mt-3 text-xs text-white/60">{generateError}</p>
                        ) : (
                            <p className="mt-3 text-[11px] text-white/25">Takes about a minute. Keep this tab open.</p>
                        )}
                    </section>
                )}

                {!loading && !error && week && (
                    <>
                        <div className="no-scrollbar overflow-x-auto">
                            <div
                                role="tablist"
                                aria-label="Training weeks"
                                onKeyDown={handleRailKeyDown}
                                className="flex w-max min-w-full gap-1 border-b border-white/[0.08]"
                            >
                                {weeks.map((weekItem, index) => {
                                    const isActive = index === activeWeek;
                                    const isCurrent = index === weekIndex;
                                    const endDate = weekItem.week_range?.end_date;
                                    const isPast = Boolean(endDate) && endDate < todayKey;
                                    const weekNumber = String(weekItem.week_number ?? index + 1).padStart(2, "0");

                                    return (
                                        <button
                                            key={weekItem.week_number ?? index}
                                            id={`week-tab-${index}`}
                                            ref={(element) => {
                                                tabRefs.current[index] = element;
                                            }}
                                            role="tab"
                                            aria-selected={isActive}
                                            aria-controls="week-panel"
                                            tabIndex={isActive ? 0 : -1}
                                            onClick={() => {
                                                setActiveWeek(index);
                                                setSelectedDay(null);
                                                setPanelClosing(false);
                                            }}
                                            className="group relative shrink-0 cursor-pointer px-4 pb-3 pt-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00]"
                                        >
                                            <span className={`block text-[10px] uppercase tracking-[0.18em] transition-colors duration-150 ${
                                                isActive || isCurrent ? "text-white/40" : "text-white/25"
                                            }`}>
                                                WK
                                            </span>
                                            <span className={`relative block text-2xl font-medium tabular-nums transition-colors duration-150 ${
                                                isActive || isCurrent
                                                    ? "text-white"
                                                    : isPast
                                                        ? "text-white/25"
                                                        : "text-white/40"
                                            } ${!isActive && !isCurrent ? "group-hover:text-white/70" : ""}`}>
                                                {weekNumber}
                                                {isCurrent && (
                                                    <span className="absolute -right-2 top-1 size-[3px] bg-[#CCFF00]" aria-hidden="true" />
                                                )}
                                            </span>
                                            {isCurrent && <span className="sr-only">current week</span>}
                                            {isActive ? (
                                                <span className="rail-line absolute inset-x-0 -bottom-px h-px bg-[#CCFF00]" />
                                            ) : (
                                                <span className="absolute inset-x-0 -bottom-px h-px bg-white/20 opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div
                            key={activeWeek}
                            id="week-panel"
                            role="tabpanel"
                            aria-labelledby={`week-tab-${activeWeek}`}
                            className="week-in"
                        >
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

                            <div className="mt-6 grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                </div>
            </main>

            {selectedDay && <SessionPanel day={selectedDay} closing={panelClosing} onClose={closeSession} />}

            {dialogOpen && plan && (
                <RegenerateDialog
                    phase={planPhase}
                    currentWeek={currentWeekNumber}
                    totalWeeks={weeks.length}
                    startDate={firstWeekStart}
                    endDate={lastWeekEnd}
                    daysUntilStart={daysUntilStart}
                    onClose={() => setDialogOpen(false)}
                    onConfirm={handleGenerate}
                />
            )}
        </AppShell>
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
                className={`flex h-full flex-col border border-white/[0.05] bg-white/[0.015] p-4 ${isToday ? "border-l-2 border-l-[#CCFF00]" : ""}`}
            >
                <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{day.day}</p>
                    <p className="text-[10px] text-white/25">{formatDate(day.date)}</p>
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
            className={`group flex h-full cursor-pointer flex-col border border-white/[0.08] bg-[#0A0A0A] p-4 transition-colors duration-150 hover:border-white/[0.16] hover:bg-[#0E0E0E] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00] ${isToday ? "border-l-2 border-l-[#CCFF00]" : ""}`}
        >
            <div className="flex items-baseline justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{day.day}</p>
                <p className="text-[10px] text-white/25">{formatDate(day.date)}</p>
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

            <CardFooter />
        </article>
    );
};

const CardFooter = () => (
    <span className="mt-auto flex items-center gap-1 pt-3 text-[10px] uppercase tracking-[0.15em] text-white/25 transition-colors duration-150 group-hover:text-white/50">
        Details
        <ArrowUpRight className="h-3 w-3" />
    </span>
);

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

    useDialogFocus(panelRef, onClose);

    return (
        <div className="fixed inset-0 plan-overlay flex justify-end">
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

const RegenerateDialog = ({ phase, currentWeek, totalWeeks, startDate, endDate, daysUntilStart, onClose, onConfirm }) => {
    const [acknowledged, setAcknowledged] = useState(false);
    const panelRef = useRef(null);

    useDialogFocus(panelRef, onClose);

    const requiresAcknowledgment = phase === "active";

    const title = phase === "upcoming"
        ? "Replace your plan?"
        : phase === "complete"
            ? "Build your next plan?"
            : "Regenerate your plan?";

    const description = phase === "upcoming"
        ? `Your plan starts ${formatDate(startDate)}${daysUntilStart > 0 ? ` — ${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"} from now` : ""}. Replacing it before it starts costs nothing.`
        : phase === "complete"
            ? `Your plan finished ${formatDate(endDate)}. Build the next block from your latest training.`
            : `You're in week ${currentWeek} of ${totalWeeks}. This plan runs ${formatDate(startDate)} – ${formatDate(endDate)}.`;

    const consequences = requiresAcknowledgment
        ? [
            "The current plan is archived and disappears from this page",
            "The new plan starts at week 1, not where you are now",
            "Weeks you've already run can't be carried over"
        ]
        : [
            "The current plan is archived",
            "The new plan is built from your goal and your latest synced runs",
            "It takes about a minute to generate"
        ];

    const confirmLabel = phase === "upcoming"
        ? "Replace plan"
        : phase === "complete"
            ? "Build next plan"
            : "Regenerate plan";

    const destructive = phase === "active";

    return (
        <div className="fixed inset-0 plan-overlay grid place-items-center p-4">
            <div className="panel-backdrop absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

            <section
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="regenerate-title"
                className="dialog-in relative w-full max-w-md border border-white/[0.08] bg-[#0A0A0A] p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <h2 id="regenerate-title" className="text-lg font-medium tracking-tight">{title}</h2>

                    <button
                        onClick={onClose}
                        autoFocus
                        aria-label="Close dialog"
                        className="grid size-7 shrink-0 cursor-pointer place-content-center border border-white/[0.08] text-white/40 transition-colors duration-150 hover:border-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00]"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>

                <p className="mt-3 text-[13px] leading-relaxed text-white/50">{description}</p>

                <ul className="mt-4 space-y-2">
                    {consequences.map((item) => (
                        <li key={item} className="flex gap-2.5 text-xs leading-relaxed text-white/40">
                            <span className="mt-[7px] h-px w-2 shrink-0 bg-white/25" aria-hidden="true" />
                            {item}
                        </li>
                    ))}
                </ul>

                {requiresAcknowledgment && (
                    <label className="mt-5 flex cursor-pointer items-start gap-2.5 border border-white/[0.06] p-3 text-xs leading-relaxed text-white/50">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(event) => setAcknowledged(event.target.checked)}
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#CCFF00]"
                        />
                        I understand my plan restarts at week 1
                    </label>
                )}

                <div className="mt-6 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="cursor-pointer text-xs text-white/40 transition-colors duration-150 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#CCFF00]"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={requiresAcknowledgment && !acknowledged}
                        className={`cursor-pointer border px-4 py-2 text-xs font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                            destructive
                                ? "border-[#FF6B6B] bg-[#FF6B6B] text-[#0B0B0B] hover:border-[#FF8080] hover:bg-[#FF8080] focus-visible:outline-[#FF6B6B]"
                                : "border-white bg-white text-black hover:bg-white/90 focus-visible:outline-white"
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Plan;
