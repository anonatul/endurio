import { useEffect, useRef, useState } from "react";
import { CalendarRange, ChevronRight, Loader2, X } from "lucide-react";

import { DashboardShell } from "../components/dashboard/DashboardShell";
import "../plan.css";

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

const formatKm = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) return null;

    return Number.isInteger(number) ? String(number) : String(number);
};

const formatDuration = (minutes) => {
    const number = Number(minutes);

    if (!Number.isFinite(number) || number <= 0) return null;
    if (number < 60) return `${Math.round(number)} min`;

    const hours = Math.floor(number / 60);
    const rest = Math.round(number % 60);

    return rest > 0 ? `${hours} h ${rest}` : `${hours} h`;
};

const phaseLabel = (name) => String(name ?? "").split("&")[0].trim();

const humanize = (key) => key.replaceAll("_", " ");

/* One intensity vocabulary for the plan, read the way a coach calls a session. */
const zoneInfo = (zone) => {
    if (!zone) return null;

    const value = String(zone).toLowerCase();

    if (value === "rest") return null;
    if (value.includes("recovery")) return { label: "Recovery", tone: "recovery" };
    if (value.includes("easy")) return { label: "Easy", tone: "easy" };
    if (value.includes("steady") || value.includes("aerobic")) return { label: "Steady", tone: "steady" };
    if (value.includes("tempo") || value.includes("threshold")) return { label: "Tempo", tone: "quality" };
    if (value.includes("interval") || value.includes("repetition") || value.includes("stride")) {
        return { label: "Intervals", tone: "quality" };
    }
    if (value.includes("race")) return { label: "Race", tone: "race" };

    return { label: humanize(value), tone: "steady" };
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
        {
            label: "Distance",
            value: week?.target_distance_km !== undefined && week?.target_distance_km !== null
                ? formatKm(week.target_distance_km)
                : null,
            unit: "km"
        },
        { label: "Time", value: formatDuration(weekSummary.total_duration_minutes), unit: null },
        { label: "Sessions", value: week?.training_days, unit: null }
    ].filter(({ value }) => value !== undefined && value !== null && value !== "");

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

    const weeklyRuns = weeks.length > 0 && weeks.every((item) => item.training_days === weeks[0].training_days)
        ? weeks[0].training_days
        : null;

    const planMeta = [
        planPhase === "upcoming" && firstWeekStart
            ? `Starts ${formatDate(firstWeekStart)}`
            : planPhase === "complete" && lastWeekEnd
                ? `Ended ${formatDate(lastWeekEnd)}`
                : weeks.length
                    ? `Week ${currentWeekNumber} of ${weeks.length}`
                    : null,
        planPhase === "upcoming" && weeks.length ? `${weeks.length} weeks` : null,
        weeklyRuns ? `${weeklyRuns} runs a week` : null,
        plan?.goal,
        plan?.race_date ? `Race ${formatDate(plan.race_date)}` : null
    ].filter(Boolean);

    const planTag = planPhase === "upcoming"
        ? { label: "Upcoming", tone: "blue" }
        : planPhase === "complete"
            ? { label: "Complete", tone: "grey" }
            : { label: "In progress", tone: "green" };

    const phaseRuns = weeks.reduce((runs, item, index) => {
        const name = item.phase || "Training";
        const last = runs[runs.length - 1];

        if (last && last.name === name) {
            last.span += 1;
        } else {
            runs.push({ name, short: phaseLabel(name), start: index, span: 1 });
        }

        return runs;
    }, []);

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
        <DashboardShell>
            <main className={`plan-page no-scrollbar flex-1 ${selectedDay || dialogOpen ? "overflow-hidden" : "overflow-auto"}`}>
                <div className="plan-wrap">
                    <header className="plan-head">
                        <div className="plan-head__copy">
                            <h1>Training plan</h1>
                            <p className="plan-head__meta">
                                {!loading && !error && plan && (
                                    <span className={`plan-tag plan-tag--${planTag.tone}`}>{planTag.label}</span>
                                )}
                                {planMeta.map((item, index) => (
                                    <span key={item} className="plan-head__meta-item">
                                        {index > 0 && <span className="plan-head__sep" aria-hidden="true">·</span>}
                                        {item}
                                    </span>
                                ))}
                            </p>
                        </div>

                        {!loading && !error && plan && (
                            generating ? (
                                <span className="plan-tag plan-tag--grey plan-tag--progress">
                                    <Loader2 className="plan-spin" aria-hidden="true" />
                                    Building your plan…
                                </span>
                            ) : (
                                <button
                                    onClick={() => setDialogOpen(true)}
                                    className="plan-btn plan-btn--dark"
                                >
                                    {regenerateLabel}
                                </button>
                            )
                        )}
                    </header>

                    {generateError && plan && (
                        <p role="alert" className="plan-alert">{generateError}</p>
                    )}

                    {loading && (
                        <div className="plan-loading" aria-hidden="true">
                            <div className="plan-skeleton__rail">
                                {Array.from({ length: 12 }).map((_, index) => (
                                    <span key={index} className="plan-skel plan-skel--week" />
                                ))}
                            </div>

                            <div className="plan-sheet plan-sheet--skeleton">
                                <div className="plan-skeleton__head">
                                    <div className="plan-skeleton__copy">
                                        <span className="plan-skel plan-skel--label" />
                                        <span className="plan-skel plan-skel--title" />
                                    </div>
                                    <div className="plan-skeleton__stats">
                                        {[0, 1, 2].map((index) => (
                                            <span key={index} className="plan-skel plan-skel--stat" />
                                        ))}
                                    </div>
                                </div>

                                <div className="plan-skeleton__rows">
                                    {[0, 1, 2, 3, 4].map((index) => (
                                        <div key={index} className="plan-skeleton__row">
                                            <span className="plan-skel plan-skel--day" />
                                            <span className="plan-skel plan-skel--what" />
                                            <span className="plan-skel plan-skel--number" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {!loading && error && (
                        <section className="plan-state plan-state--error">
                            <p className="plan-state__title">Could not load your plan</p>
                            <p>{error}</p>
                        </section>
                    )}

                    {!loading && !error && !plan && (
                        <section className="plan-state">
                            <CalendarRange className="plan-state__icon" aria-hidden="true" />
                            <h2>No active plan</h2>
                            <p>
                                Generate one and it will be built around your goal, your weekly schedule
                                and your recent running.
                            </p>
                            <button
                                onClick={handleGenerate}
                                disabled={generating}
                                className="plan-btn plan-btn--dark"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="plan-spin" aria-hidden="true" />
                                        Building your plan…
                                    </>
                                ) : (
                                    "Generate plan"
                                )}
                            </button>

                            {generating && (
                                <span className="plan-progress" aria-hidden="true">
                                    <span />
                                </span>
                            )}

                            {generateError ? (
                                <p role="alert" className="plan-alert">{generateError}</p>
                            ) : (
                                <p className="plan-state__hint">Takes about a minute. Keep this tab open.</p>
                            )}
                        </section>
                    )}

                    {!loading && !error && week && (
                        <>
                            <div className="plan-weeks">
                                <div className="plan-weeks__scroll">
                                    <div
                                        className="plan-weeks__inner"
                                        style={{ "--plan-week-count": weeks.length }}
                                    >
                                        <div className="plan-phaseband" aria-hidden="true">
                                            {phaseRuns.map((run) => (
                                                <span
                                                    key={`${run.name}-${run.start}`}
                                                    className="plan-phaseband__item"
                                                    style={{ gridColumn: `${run.start + 1} / span ${run.span}` }}
                                                    title={run.name}
                                                >
                                                    {run.short}
                                                </span>
                                            ))}
                                        </div>

                                        <div
                                            role="tablist"
                                            aria-label="Training weeks"
                                            onKeyDown={handleRailKeyDown}
                                            className="plan-rail"
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
                                                        className={`plan-week${isActive ? " is-active" : ""}${isPast ? " is-past" : ""}`}
                                                    >
                                                        <span className="plan-week__no">
                                                            {weekNumber}
                                                            {isCurrent && <span className="plan-week__now" aria-hidden="true" />}
                                                        </span>
                                                        <span className="plan-week__km">
                                                            {weekItem.target_distance_km !== undefined && weekItem.target_distance_km !== null
                                                                ? `${formatKm(weekItem.target_distance_km)} km`
                                                                : "—"}
                                                        </span>
                                                        {isCurrent && <span className="sr-only">current week</span>}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section
                                key={activeWeek}
                                id="week-panel"
                                role="tabpanel"
                                aria-labelledby={`week-tab-${activeWeek}`}
                                className="plan-sheet week-in"
                            >
                                <header className="plan-sheet__head">
                                    <div className="plan-sheet__identity">
                                        <p className="plan-sheet__eyebrow">
                                            <span>Week {String(week.week_number ?? activeWeek + 1).padStart(2, "0")}</span>
                                            <span aria-hidden="true">·</span>
                                            <span>{formatWeekRange(week.week_range)}</span>
                                        </p>
                                        <h2 className="plan-sheet__title">
                                            {week.phase || "Training week"}
                                        </h2>
                                    </div>

                                    <dl className="plan-sheet__stats">
                                        {weekMetrics.map(({ label, value, unit }) => (
                                            <div key={label} className="plan-sheet__stat">
                                                <dt>{label}</dt>
                                                <dd>
                                                    {value}
                                                    {unit && <span>{unit}</span>}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </header>

                                {weekNotes && <p className="plan-sheet__note">{weekNotes}</p>}

                                <div className="plan-days">
                                    <div className="plan-days__head" aria-hidden="true">
                                        <span>Day</span>
                                        <span>Session</span>
                                        <span>Zone</span>
                                        <span>Time</span>
                                        <span>Pace</span>
                                        <span className="plan-days__dist">Distance</span>
                                        <span />
                                    </div>

                                    <ol className="plan-days__list">
                                        {(week.days || []).map((day) => (
                                            <DayRow
                                                key={day.date}
                                                day={day}
                                                isToday={day.date === todayKey}
                                                onSelect={(element) => openSession(day, element)}
                                            />
                                        ))}
                                    </ol>
                                </div>
                            </section>
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
        </DashboardShell>
    );
};

const DayRow = ({ day, isToday, onSelect }) => {
    const isRest = Boolean(day.rest);
    const zone = zoneInfo(day.intensity_zone);
    const parsed = day.main_set ? parseMainSet(day.main_set) : null;
    const subline = parsed?.headline || day.description || day.notes;
    const distance = !isRest && day.distance_km !== undefined && day.distance_km !== null
        ? formatKm(day.distance_km)
        : null;
    const duration = !isRest ? formatDuration(day.duration_minutes) : null;
    const pace = !isRest ? day.pace_readable : null;

    const handleKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(event.currentTarget);
        }
    };

    const content = (
        <>
            <span className="plan-day__when">
                <span className="plan-day__dow">{day.day ? day.day.slice(0, 3) : "—"}</span>
                <span className="plan-day__date">{formatDate(day.date)}</span>
                {isToday && <span className="plan-day__today">Today</span>}
            </span>

            <span className="plan-day__what">
                <span className="plan-day__type">{day.workout_type}</span>
                {subline && <span className="plan-day__sub">{subline}</span>}
                {!isRest && (
                    <span className="plan-day__compact">
                        {duration && <span>{duration}</span>}
                        {pace && <><span className="plan-day__sep" aria-hidden="true">·</span><span>{pace}</span></>}
                        {zone && (
                            <>
                                <span className="plan-day__sep" aria-hidden="true">·</span>
                                <span className={`plan-day__compact-zone plan-zone plan-zone--${zone.tone}`}>
                                    {zone.label}
                                </span>
                            </>
                        )}
                    </span>
                )}
            </span>

            <span className="plan-day__zone">
                {zone ? (
                    <span className={`plan-zone plan-zone--${zone.tone}`}>
                        {zone.label}
                    </span>
                ) : "—"}
            </span>

            <span className="plan-day__time">{duration || "—"}</span>
            <span className="plan-day__pace">{pace || "—"}</span>
            <span className="plan-day__dist">
                {distance !== null ? <>{distance}<em>km</em></> : "—"}
            </span>
            <span className="plan-day__arrow">
                {!isRest && <ChevronRight aria-hidden="true" />}
            </span>
        </>
    );

    return (
        <li className="plan-day-item">
            {isRest ? (
                <div className="plan-day plan-day--rest">
                    {content}
                </div>
            ) : (
                <button
                    onClick={(event) => onSelect(event.currentTarget)}
                    onKeyDown={handleKeyDown}
                    aria-label={`Open ${day.day} ${formatDate(day.date)} — ${day.workout_type}`}
                    className={`plan-day plan-day--workout${isToday ? " is-today" : ""}`}
                >
                    {content}
                </button>
            )}
        </li>
    );
};

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

const SessionPanel = ({ day, closing, onClose }) => {
    const panelRef = useRef(null);
    const parsed = day.main_set ? parseMainSet(day.main_set) : null;
    const zone = zoneInfo(day.intensity_zone);

    const metrics = [
        { label: "Distance", value: day.distance_km, unit: "km" },
        { label: "Duration", value: day.duration_minutes, unit: "min" },
        { label: "Pace", value: day.pace_readable, unit: null },
        { label: "Zone", value: zone?.label, unit: null, tone: zone?.tone }
    ].filter(({ value }) => value !== undefined && value !== null && value !== "");

    useDialogFocus(panelRef, onClose);

    return (
        <div className="plan-overlay plan-overlay--panel">
            <div
                className={`plan-scrim${closing ? " is-closing" : ""}`}
                onClick={onClose}
                aria-hidden="true"
            />

            <section
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="session-title"
                className={`plan-panel${closing ? " panel-out" : " panel-in"}`}
            >
                <div className="plan-panel__head">
                    <div>
                        <p className="plan-detail__meta">
                            {day.day}
                            {formatDate(day.date) && ` · ${formatDate(day.date)}`}
                        </p>
                        <h2 id="session-title">{day.workout_type}</h2>
                        {day.description && (
                            <p className="plan-panel__description">{day.description}</p>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        autoFocus
                        aria-label="Close session details"
                        className="plan-icon-btn"
                    >
                        <X aria-hidden="true" />
                    </button>
                </div>

                {metrics.length > 0 && (
                    <div className="plan-detail__metrics">
                        {metrics.map(({ label, value, unit, tone }) => (
                            <div key={label} className="plan-detail__metric">
                                <p className="plan-detail__label">{label}</p>
                                <p className="plan-detail__value">
                                    {tone ? (
                                        <span className={`plan-zone plan-zone--${tone}`}>{value}</span>
                                    ) : (
                                        <>
                                            {value}
                                            {unit && <span>{unit}</span>}
                                        </>
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {parsed && (
                    <div className="plan-detail__block">
                        <p className="plan-detail__label">Session</p>

                        {parsed.headline && (
                            <p className="plan-detail__headline">{parsed.headline}</p>
                        )}

                        {(parsed.recovery || parsed.steps.length > 0) && (
                            <dl className="plan-detail__list">
                                {parsed.recovery && (
                                    <div>
                                        <dt>Recovery</dt>
                                        <dd>{parsed.recovery}</dd>
                                    </div>
                                )}
                                {parsed.steps.map(({ label, value }) => (
                                    <div key={`${label}-${value}`}>
                                        <dt>{label}</dt>
                                        <dd>{value}</dd>
                                    </div>
                                ))}
                            </dl>
                        )}
                    </div>
                )}

                {day.notes && (
                    <div className="plan-detail__notes">
                        <p className="plan-detail__label">Notes</p>
                        <p>{day.notes}</p>
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
        <div className="plan-overlay plan-overlay--dialog">
            <div className="plan-scrim" onClick={onClose} aria-hidden="true" />

            <section
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="regenerate-title"
                className="plan-dialog dialog-in"
            >
                <div className="plan-dialog__head">
                    <h2 id="regenerate-title">{title}</h2>

                    <button
                        onClick={onClose}
                        autoFocus
                        aria-label="Close dialog"
                        className="plan-icon-btn"
                    >
                        <X aria-hidden="true" />
                    </button>
                </div>

                <p className="plan-dialog__copy">{description}</p>

                <ul className="plan-dialog__list">
                    {consequences.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>

                {requiresAcknowledgment && (
                    <label className="plan-check">
                        <input
                            type="checkbox"
                            checked={acknowledged}
                            onChange={(event) => setAcknowledged(event.target.checked)}
                        />
                        <span>I understand my plan restarts at week 1</span>
                    </label>
                )}

                <div className="plan-dialog__actions">
                    <button onClick={onClose} className="plan-btn plan-btn--ghost">
                        Cancel
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={requiresAcknowledgment && !acknowledged}
                        className={`plan-btn ${destructive ? "plan-btn--danger" : "plan-btn--dark"}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Plan;
