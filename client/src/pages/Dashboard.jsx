import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarDays,
    ChevronRight,
    Clock3,
    Footprints,
    RefreshCw,
    Route as RouteIcon,
    Timer
} from "lucide-react";
import {
    AnimatePresence,
    MotionConfig,
    animate,
    motion,
    useMotionValue,
    useReducedMotion,
    useTransform
} from "framer-motion";

import { DashboardShell } from "../components/dashboard/DashboardShell";
import "../dashboard.css";

const EASE_OUT = [0.22, 1, 0.36, 1];

const CHART_VARIANTS = [
    { id: "bars", label: "Bars" },
    { id: "trend", label: "Trend" }
];

const CHART_LEGENDS = {
    bars: [{ tone: "ink", label: "Weekly distance" }],
    trend: [{ tone: "ink", label: "Weekly distance" }, { swatch: "dashed", label: "4-week average" }]
};

const prefersReducedMotion = () =>
    typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DAY_MS = 86400000;

const pad = (value) => String(value).padStart(2, "0");

const todayKey = () => {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const dayKey = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value.slice(0, 10);
    return value.toISOString().slice(0, 10);
};

const addDays = (key, days) => {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

const mondayOf = (key) => {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
    return date.toISOString().slice(0, 10);
};

const dateAtNoon = (key) => new Date(`${key}T12:00:00Z`);

const formatShortDay = (key) =>
    dateAtNoon(key).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

const formatTodayLabel = () =>
    new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

const formatClock = (decimalMinutes) => {
    const value = Number(decimalMinutes);
    if (!Number.isFinite(value) || value <= 0) return "No time";

    const totalSeconds = Math.round(value * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = pad(totalSeconds % 60);

    return hours > 0 ? `${hours}:${pad(minutes)}:${seconds}` : `${minutes}:${seconds}`;
};

const formatPacePerKm = (decimalMinutes) => {
    const value = Number(decimalMinutes);
    if (!Number.isFinite(value) || value <= 0) return { text: "Not recorded", unit: "" };

    return { text: formatClock(value), unit: "/km" };
};

const formatRunDuration = (seconds) => {
    const value = Number(seconds);
    if (!Number.isFinite(value) || value <= 0) return "Not recorded";

    const totalMinutes = Math.round(value / 60);
    if (totalMinutes < 60) return `${totalMinutes} min`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
};

const formatKm = (meters) => {
    const value = Number(meters);
    if (!Number.isFinite(value) || value <= 0) return "Not recorded";
    return `${(value / 1000).toFixed(1)} km`;
};

const formatPaceFromSpeed = (speed) => {
    const value = Number(speed);
    if (!Number.isFinite(value) || value <= 0) return "Not recorded";
    return formatClock(1000 / value / 60);
};

const formatSyncTime = (value) => {
    if (!value) return "Not synced yet";

    return new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit"
    });
};

const formatPBDate = (value) => {
    const key = dayKey(value);
    if (!key) return "No effort yet";

    return dateAtNoon(key).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
    });
};

const runTypeLabel = (value) => {
    if (Number(value) === 1) return "Race";
    if (Number(value) === 2) return "Long run";
    if (Number(value) === 3) return "Workout";
    return "Run";
};

const runTypeTone = (value) => {
    if (Number(value) === 1) return "purple";
    if (Number(value) === 2) return "blue";
    if (Number(value) === 3) return "pink";
    return "grey";
};

const sessionState = (date, today) => {
    const daysUntil = Math.round(
        (Date.parse(`${dayKey(date)}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS
    );

    if (daysUntil <= 0) return { label: "Today", tone: "green" };
    if (daysUntil <= 7) return { label: "This week", tone: "blue" };
    return { label: "Scheduled", tone: "grey" };
};

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [recentRuns, setRecentRuns] = useState([]);
    const [activityRuns, setActivityRuns] = useState([]);
    const [plan, setPlan] = useState(null);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [chartVariant, setChartVariant] = useState(() => {
        if (typeof window === "undefined") return "bars";

        const stored = window.localStorage.getItem("dw-chart-variant");

        return CHART_VARIANTS.some((item) => item.id === stored) ? stored : "bars";
    });
    const hasAutoSynced = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        window.localStorage.setItem("dw-chart-variant", chartVariant);
    }, [chartVariant]);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/activities/sync`, {
                method: "POST",
                credentials: "include"
            });
        } catch (syncError) {
            console.error("Error syncing data:", syncError);
        }
        setSyncing(false);
        setRefreshKey((key) => key + 1);
    };

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            try {
                const [statsResponse, runsResponse, planResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/stats/dashboard`, { credentials: "include" }),
                    fetch(`${import.meta.env.VITE_API_URL}/activities?limit=40`, { credentials: "include" }),
                    fetch(`${import.meta.env.VITE_API_URL}/plans`, { credentials: "include" })
                ]);

                if (!statsResponse.ok) {
                    throw new Error("We couldn't load your training stats.");
                }

                const [stats, runs, planPayload] = await Promise.all([
                    statsResponse.json(),
                    runsResponse.ok ? runsResponse.json() : { activities: [] },
                    planResponse.ok ? planResponse.json() : { plan: null }
                ]);

                if (cancelled) return;

                const runActivities = Array.isArray(runs.activities)
                    ? runs.activities.filter((activity) => activity.sport_type === "Run")
                    : [];

                setData(stats);
                setActivityRuns(runActivities);
                setRecentRuns(runActivities.slice(0, 5));
                setPlan(planPayload.plan ?? null);
                setError(null);
            } catch (loadError) {
                if (!cancelled) {
                    console.error(loadError);
                    setError(loadError.message || "Something went wrong loading your dashboard.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            cancelled = true;
        };
    }, [refreshKey]);

    useEffect(() => {
        if (!loading && data?.userMetadata && !hasAutoSynced.current) {
            if (data.userMetadata.initial_sync_status === false) {
                hasAutoSynced.current = true;
                queueMicrotask(() => handleSync());
            }
        }
    }, [loading, data]);

    const weeklyMileage = data?.weeklyMileage ?? [];
    const summary = data?.activitySummary?.[0] ?? {};
    const longestRun = data?.longestRun?.[0];
    const fastest5K = data?.fastest5K?.[0];
    const fastest10K = data?.fastest10K?.[0];

    const today = todayKey();
    const thisMonday = mondayOf(today);
    const weeklyByStart = new Map(weeklyMileage.map((week) => [dayKey(week.week_start), week]));

    const series = Array.from({ length: 7 }, (_, index) => {
        const key = addDays(thisMonday, -7 * (6 - index));
        const row = weeklyByStart.get(key);

        return {
            key,
            label: formatShortDay(key),
            km: row ? Number(row.distance_km) : 0,
            hours: row ? Number(row.moving_time_hours) : 0,
            elevation: row ? Number(row.total_elevation_gain) : 0,
            runs: row ? Number(row.total_runs) : 0
        };
    });

    const currentWeek = series[series.length - 1];
    const completedWeeks = series.slice(2, 6);
    const fourWeekAverage = completedWeeks.length
        ? completedWeeks.reduce((total, week) => total + week.km, 0) / completedWeeks.length
        : 0;
    const bestWeek = series.reduce((best, week) => Math.max(best, week.km), 0);
    const sevenWeekTotal = series.reduce((total, week) => total + week.km, 0);

    const recentWeeks = series.slice(3);
    const fourWeekRuns = recentWeeks.reduce((total, week) => total + week.runs, 0);

    const calendarWeeks = buildTrainingCalendar(activityRuns, 4);
    const calendarActiveWeeks = calendarWeeks.filter((week) => week.days.some((day) => day.km > 0)).length;

    const planWeeks = plan?.raw_plan?.weeks ?? [];
    const firstPlanWeek = planWeeks[0] ?? null;
    const currentPlanWeek = planWeeks.find(
        (week) => today >= week.week_range.start_date && today <= week.week_range.end_date
    ) ?? null;

    const planPhase = !plan || planWeeks.length === 0
        ? "none"
        : currentPlanWeek
            ? "active"
            : today < firstPlanWeek.week_range.start_date
                ? "upcoming"
                : "complete";

    const focusWeek = currentPlanWeek
        ?? (planPhase === "upcoming" ? firstPlanWeek : planWeeks[planWeeks.length - 1])
        ?? null;

    const daysToPlan = planPhase === "upcoming"
        ? Math.max(
            0,
            Math.round(
                (Date.parse(`${firstPlanWeek.week_range.start_date}T00:00:00Z`)
                    - Date.parse(`${today}T00:00:00Z`)) / DAY_MS
            )
        )
        : 0;

    const planStatus = planPhase === "active"
        ? `Week ${focusWeek.week_number} of ${plan.duration_weeks ?? planWeeks.length}`
        : planPhase === "upcoming"
            ? daysToPlan === 0
                ? "Starts today"
                : `Starts in ${daysToPlan} day${daysToPlan === 1 ? "" : "s"}`
            : planPhase === "complete"
                ? "Plan complete"
                : "No plan yet";

    const totalRuns = Number(summary.total_runs ?? 0);
    const averageRunMinutes = totalRuns > 0
        ? Math.round((Number(summary.total_hours ?? 0) * 60) / totalRuns)
        : 0;
    const paceStat = formatPacePerKm(summary.avg_pace_per_km);
    const hasVolume = series.some((week) => week.km > 0);

    const totalWeeks = plan?.duration_weeks ?? planWeeks.length;
    const planDays = focusWeek?.days ?? [];
    const planSessions = focusWeek?.training_days ?? planDays.filter((day) => !day.rest).length;
    const focusTarget = focusWeek ? Number(focusWeek.target_distance_km ?? 0) : 0;
    const progress = planPhase === "active" && focusTarget > 0
        ? Math.min((currentWeek.km / focusTarget) * 100, 100)
        : null;

    const upcomingSessions = planWeeks
        .flatMap((week) =>
            (week.days ?? [])
                .filter((day) => !day.rest)
                .map((day) => ({ ...day, weekNumber: week.week_number }))
        )
        .filter((day) => dayKey(day.date) >= today)
        .slice(0, 5);

    const shareWeeks = series.slice(2);
    const shareMax = Math.max(...shareWeeks.map((week) => week.km), 1);
    const runsMax = Math.max(...recentWeeks.map((week) => week.runs), 1);

    return (
        <MotionConfig reducedMotion="user">
            <DashboardShell>
                <header className="dw-toolbar">
                    <div className="dw-toolbar__context">
                        <span className="dw-toolbar__datebox">
                            <CalendarDays aria-hidden="true" />
                            <span className="dw-toolbar__period">Last 30 days</span>
                            <span className="dw-toolbar__divider" aria-hidden="true" />
                            <span className="dw-toolbar__date">{formatTodayLabel()}</span>
                        </span>
                    </div>

                    <div className="dw-toolbar__actions">
                        <p className="dw-sync-meta">
                            Synced {formatSyncTime(data?.userMetadata?.last_synced_at)}
                        </p>
                        <button
                            type="button"
                            className="dw-btn dw-btn--dark"
                            onClick={handleSync}
                            disabled={syncing}
                        >
                            <RefreshCw className={syncing ? "is-spinning" : ""} aria-hidden="true" />
                            {syncing ? "Syncing" : "Sync Strava"}
                        </button>
                    </div>
                </header>

                <h1 className="visually-hidden">Dashboard</h1>

                {error && (
                    <div className="dw-alert" role="alert">
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={() => {
                                setLoading(true);
                                setRefreshKey((key) => key + 1);
                            }}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {loading ? (
                    <DashboardSkeleton />
                ) : data ? (
                    <>
                        <section className="dw-kpis" aria-label="Last 30 days summary">
                            <KpiCard
                                icon={RouteIcon}
                                label="Distance"
                                value={Number(summary.total_distance ?? 0)}
                                decimals={1}
                                unit="km"
                                hint={`${totalRuns} ${totalRuns === 1 ? "run" : "runs"} logged`}
                            />
                            <KpiCard
                                icon={Clock3}
                                label="Moving time"
                                value={Number(summary.total_hours ?? 0)}
                                decimals={1}
                                unit="h"
                                hint={totalRuns > 0 ? `${averageRunMinutes} min average run` : "No runs logged"}
                            />
                            <KpiCard
                                icon={Timer}
                                label="Average pace"
                                text={paceStat.text === "Not recorded" ? "—" : paceStat.text}
                                unit={paceStat.unit}
                                hint="30-day average"
                            />
                            <KpiCard
                                icon={Footprints}
                                label="Runs"
                                value={totalRuns}
                                hint={`${fourWeekRuns} in the last 4 weeks`}
                            />
                        </section>

                        <div className="dw-grid">
                            <section className="dw-card dw-volume" aria-labelledby="volume-title">
                                <div className="dw-card__head">
                                    <h2 id="volume-title" className="dw-card__title">Weekly volume</h2>
                                    {hasVolume && (
                                        <div className="dw-chart__switch" role="group" aria-label="Chart view">
                                            {CHART_VARIANTS.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    aria-pressed={chartVariant === item.id}
                                                    className={`dw-chart__switch-item${chartVariant === item.id ? " is-active" : ""}`}
                                                    onClick={() => setChartVariant(item.id)}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {hasVolume ? (
                                    <>
                                        <VolumeChart points={series} variant={chartVariant} average={fourWeekAverage} />
                                        <div className="dw-chart__foot">
                                            <span className="dw-legend-items">
                                                {(CHART_LEGENDS[chartVariant] ?? CHART_LEGENDS.bars).map((item) => (
                                                    <span className="dw-legend-item" key={item.label}>
                                                        {item.swatch === "dashed" ? (
                                                            <span className="dw-legend-dash" aria-hidden="true" />
                                                        ) : (
                                                            <span className={`dw-dot dw-dot--${item.tone}`} aria-hidden="true" />
                                                        )}
                                                        {item.label}
                                                    </span>
                                                ))}
                                            </span>
                                            <p className="dw-chart__total">
                                                <span>Total</span>
                                                <strong><AnimatedNumber value={sevenWeekTotal} /> km</strong>
                                                <span className="dw-chart__best">Best {bestWeek.toFixed(1)} km</span>
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <div className="dw-empty">
                                        <strong>No runs in the last seven weeks</strong>
                                        <p>Sync Strava and this chart fills with one bar per week, Monday to Sunday.</p>
                                        <button
                                            type="button"
                                            className="dw-text-button"
                                            onClick={handleSync}
                                            disabled={syncing}
                                        >
                                            <RefreshCw aria-hidden="true" />
                                            {syncing ? "Syncing" : "Sync Strava"}
                                        </button>
                                    </div>
                                )}
                            </section>

                            <div className="dw-rail">
                                <ConsistencyCard
                                    weeks={calendarWeeks}
                                    activeWeeks={calendarActiveWeeks}
                                    totalWeeks={calendarWeeks.length}
                                    fourWeekRuns={fourWeekRuns}
                                    fourWeekAverage={fourWeekAverage}
                                />
                                <ShareCard weeks={shareWeeks} max={shareMax} />
                            </div>

                            <PlanCard
                                planPhase={planPhase}
                                focusWeek={focusWeek}
                                planStatus={planStatus}
                                planSessions={planSessions}
                                totalWeeks={totalWeeks}
                                focusTarget={focusTarget}
                                currentKm={currentWeek.km}
                                progress={progress}
                                onOpenPlan={() => navigate("/plan")}
                            />

                            <RunsChartCard weeks={recentWeeks} max={runsMax} />

                            <BestsCard
                                fastest5K={fastest5K}
                                fastest10K={fastest10K}
                                longestRun={longestRun}
                            />

                            <section className="dw-card dw-recent" aria-labelledby="recent-title">
                                <div className="dw-card__head">
                                    <h2 id="recent-title" className="dw-card__title">Recent runs</h2>
                                    <p className="dw-card__meta">Latest first</p>
                                </div>
                                <RunsTable runs={recentRuns} totalRuns={totalRuns} />
                            </section>

                            <SessionsCard
                                sessions={upcomingSessions}
                                today={today}
                                onOpenPlan={() => navigate("/plan")}
                            />
                        </div>
                    </>
                ) : null}
            </DashboardShell>
        </MotionConfig>
    );
}

const AnimatedNumber = ({ value, decimals = 0 }) => {
    const reduceMotion = useReducedMotion();
    const motionValue = useMotionValue(reduceMotion ? value : 0);
    const text = useTransform(motionValue, (latest) => latest.toFixed(decimals));

    useEffect(() => {
        if (reduceMotion || prefersReducedMotion()) {
            motionValue.set(value);
            return undefined;
        }

        const controls = animate(motionValue, value, { duration: 0.85, ease: EASE_OUT });

        return () => controls.stop();
    }, [motionValue, reduceMotion, value]);

    return <motion.span>{text}</motion.span>;
};

const KpiCard = ({ icon: Icon, label, value, text, decimals = 0, unit, hint }) => (
    <section className="dw-card dw-kpi">
        <span className="dw-kpi__icon" aria-hidden="true">
            <Icon />
        </span>
        <div className="dw-kpi__body">
            <p className="dw-kpi__label">{label}</p>
            <p className="dw-kpi__value">
                {text ?? <AnimatedNumber value={value} decimals={decimals} />}
                {unit && <span className="dw-kpi__unit">{unit}</span>}
            </p>
            <p className="dw-kpi__hint">{hint}</p>
        </div>
    </section>
);

const useElementSize = (ref) => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;

        const observer = new ResizeObserver((entries) => {
            const box = entries[0]?.contentRect;
            if (box) setSize({ width: box.width, height: box.height });
        });

        observer.observe(element);
        return () => observer.disconnect();
    }, [ref]);

    return size;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const smoothPath = (coords) => {
    if (coords.length < 2) return "";

    let path = `M ${coords[0].x} ${coords[0].y}`;

    for (let index = 0; index < coords.length - 1; index += 1) {
        const previous = coords[index - 1] ?? coords[index];
        const current = coords[index];
        const next = coords[index + 1];
        const after = coords[index + 2] ?? next;
        const tension = 0.16;

        const control1 = {
            x: current.x + (next.x - previous.x) * tension,
            y: clamp(current.y + (next.y - previous.y) * tension, current.y, next.y)
        };
        const control2 = {
            x: next.x - (after.x - current.x) * tension,
            y: clamp(next.y - (after.y - current.y) * tension, current.y, next.y)
        };

        path += ` C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${next.x} ${next.y}`;
    }

    return path;
};

const VolumeChart = ({ points, variant, average }) => {
    const peak = Math.max(...points.map((point) => point.km), 1);
    const step = peak <= 20 ? 5 : peak <= 40 ? 10 : 20;
    const yMax = Math.max(Math.ceil(peak / step) * step, step);
    const ticks = Array.from({ length: yMax / step + 1 }, (_, index) => index * step);
    const [activeIndex, setActiveIndex] = useState(null);
    const reduceMotion = useReducedMotion();
    const slotWidth = 100 / points.length;
    const areaRef = useRef(null);
    const { width, height } = useElementSize(areaRef);

    const geometry = points.map((point) => {
        const kmPercent = point.km > 0 ? (point.km / yMax) * 100 : 0;
        const capPercent = point.km > 0
            ? Math.min(100 - kmPercent, Math.max(kmPercent * 0.3, 3.5))
            : 0;
        const barPercent = point.km > 0 ? kmPercent : 1.6;

        return { barPercent, capPercent, total: barPercent + capPercent };
    });

    const activePoint = activeIndex === null ? null : points[activeIndex];
    const activeGeometry = activeIndex === null ? null : geometry[activeIndex];

    return (
        <div className="dw-chart">
            <div className="dw-chart__y" aria-hidden="true">
                {ticks.slice().reverse().map((tick) => <span key={tick}>{tick}</span>)}
            </div>

            <div className="dw-chart__plot">
                <div className="dw-chart__area" ref={areaRef}>
                    <div className="dw-chart__grid" aria-hidden="true">
                        {ticks.map((tick) => (
                            <span
                                key={tick}
                                className="dw-chart__gridline"
                                style={{ bottom: `${(tick / yMax) * 100}%` }}
                            />
                        ))}
                    </div>

                    {variant === "trend" && (
                        <TrendMarks
                            points={points}
                            width={width}
                            height={height}
                            yMax={yMax}
                            average={average}
                            activeIndex={activeIndex}
                        />
                    )}

                    <div className="dw-chart__slots">
                        {points.map((point, index) => {
                            const { barPercent, capPercent, total } = geometry[index];
                            const isActive = activeIndex === index;

                            return (
                                <button
                                    type="button"
                                    key={point.key}
                                    className={`dw-chart__slot${isActive ? " is-active" : ""}`}
                                    style={{ left: `${index * slotWidth}%`, width: `${slotWidth}%` }}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                    onFocus={() => setActiveIndex(index)}
                                    onBlur={() => setActiveIndex(null)}
                                    aria-label={`${point.label}: ${point.km.toFixed(1)} kilometres, ${point.hours.toFixed(1)} hours moving`}
                                >
                                    {variant === "bars" && (
                                        <motion.span
                                            className="dw-chart__column"
                                            initial={reduceMotion ? false : { scaleY: 0, opacity: 0 }}
                                            animate={{ scaleY: 1, opacity: 1 }}
                                            transition={{
                                                duration: 0.6,
                                                delay: reduceMotion ? 0 : index * 0.055,
                                                ease: EASE_OUT
                                            }}
                                            style={{ height: `${total}%` }}
                                        >
                                            {capPercent > 0 && (
                                                <span
                                                    className="dw-chart__cap"
                                                    style={{ height: `${(capPercent / total) * 100}%` }}
                                                />
                                            )}
                                            <span
                                                className={`dw-chart__bar${point.km > 0 ? "" : " is-empty"}`}
                                                style={{ height: `${(barPercent / total) * 100}%` }}
                                            />
                                        </motion.span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {activePoint && activeGeometry && (
                        <>
                            <span
                                className="dw-chart__crosshair"
                                style={{
                                    left: `${(activeIndex + 0.5) * slotWidth}%`,
                                    height: `${activeGeometry.total}%`
                                }}
                                aria-hidden="true"
                            />
                            <span
                                className="dw-chart__marker"
                                style={{
                                    left: `${(activeIndex + 0.5) * slotWidth}%`,
                                    bottom: `calc(${activeGeometry.barPercent}% + 4px)`
                                }}
                                aria-hidden="true"
                            />
                        </>
                    )}

                    <AnimatePresence>
                        {activePoint && activeGeometry && (
                            <motion.div
                                key="tooltip"
                                className="dw-chart__tooltip"
                                style={
                                    activeGeometry.total > 58
                                        ? {
                                            left: `clamp(74px, ${(activeIndex + 0.5) * slotWidth}%, calc(100% - 74px))`,
                                            top: 6
                                        }
                                        : {
                                            left: `clamp(74px, ${(activeIndex + 0.5) * slotWidth}%, calc(100% - 74px))`,
                                            bottom: `calc(${activeGeometry.total}% + 12px)`
                                        }
                                }
                                initial={{ opacity: 0, x: "-50%", y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, x: "-50%", y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: "-50%", y: 6, scale: 0.97 }}
                                transition={{ duration: 0.16, ease: "easeOut" }}
                                aria-hidden="true"
                            >
                                <p className="dw-chart__tooltip-date">{activePoint.label}</p>
                                <p className="dw-chart__tooltip-row">
                                    <span className="dw-dot dw-dot--on-dark" />
                                    {activePoint.km.toFixed(1)} km
                                </p>
                                <p className="dw-chart__tooltip-row">
                                    <span className="dw-dot dw-dot--muted dw-dot--on-dark" />
                                    {activePoint.hours.toFixed(1)} h moving
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="dw-chart__labels" aria-hidden="true">
                    {points.map((point, index) => (
                        <span
                            key={point.key}
                            className={[
                                index === points.length - 1 ? "is-current" : "",
                                index === activeIndex ? "is-active" : ""
                            ].filter(Boolean).join(" ")}
                        >
                            {point.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TrendMarks = ({ points, width, height, yMax, average, activeIndex }) => {
    if (!width || !height) return null;

    const coords = points.map((point, index) => ({
        x: (index + 0.5) * (width / points.length),
        y: height - (point.km / yMax) * height
    }));
    const line = smoothPath(coords);
    const fill = `${line} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`;
    const averageY = average > 0 ? height - (average / yMax) * height : null;

    return (
        <svg className="dw-chart__marks" width={width} height={height} aria-hidden="true">
            <defs>
                <linearGradient id="dw-trend-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dw-ink)" stopOpacity="0.2" />
                    <stop offset="55%" stopColor="var(--dw-ink)" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="var(--dw-ink)" stopOpacity="0.005" />
                </linearGradient>
            </defs>

            {averageY !== null && (
                <>
                    <line
                        x1="0"
                        x2={width}
                        y1={averageY}
                        y2={averageY}
                        stroke="var(--dw-line-strong)"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                    <text x={width - 2} y={averageY - 6} className="dw-chart__marks-label">
                        {`avg ${average.toFixed(1)} km`}
                    </text>
                </>
            )}

            <path d={fill} fill="url(#dw-trend-fill)" />
            <path
                d={line}
                fill="none"
                stroke="var(--dw-ink)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {coords.map((coord, index) => (
                <circle
                    key={points[index].key}
                    cx={coord.x}
                    cy={coord.y}
                    r={index === activeIndex ? 4.5 : index === points.length - 1 ? 4 : 3}
                    fill={index === points.length - 1 || index === activeIndex ? "var(--dw-ink)" : "var(--dw-surface)"}
                    stroke="var(--dw-ink)"
                    strokeWidth="1.6"
                />
            ))}
        </svg>
    );
};

const buildTrainingCalendar = (runs, weeks = 4) => {
    const byDay = new Map();

    for (const run of runs) {
        const key = dayKey(run.start_date_local);
        if (!key) continue;

        const distance = Number(run.distance ?? 0);
        byDay.set(key, (byDay.get(key) ?? 0) + (Number.isFinite(distance) ? distance / 1000 : 0));
    }

    const firstMonday = addDays(mondayOf(todayKey()), -(weeks - 1) * 7);

    return Array.from({ length: weeks }, (_, index) => {
        const weekStart = addDays(firstMonday, index * 7);

        return {
            key: weekStart,
            label: formatShortDay(weekStart),
            days: Array.from({ length: 7 }, (__, day) => {
                const key = addDays(weekStart, day);

                return { key, km: byDay.get(key) ?? 0 };
            })
        };
    });
};

const ConsistencyCard = ({ weeks, activeWeeks, totalWeeks, fourWeekRuns, fourWeekAverage }) => {
    const peak = Math.max(...weeks.flatMap((week) => week.days.map((day) => day.km)), 1);
    const bestWeek = Math.max(...weeks.map((week) => week.days.reduce((sum, day) => sum + day.km, 0)), 0);

    return (
        <section className="dw-card dw-consistency" aria-labelledby="consistency-title">
            <div className="dw-card__head">
                <h2 id="consistency-title" className="dw-card__title">Consistency</h2>
                <p className="dw-card__meta">Last 4 weeks</p>
            </div>

            <div className="dw-consistency__body">
                <div className="dw-calendar" aria-hidden="true">
                    <div className="dw-calendar__row dw-calendar__row--head">
                        <span className="dw-calendar__label" />
                        <span className="dw-calendar__days">
                            {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                                <span className="dw-calendar__day-label" key={`${day}-${index}`}>{day}</span>
                            ))}
                        </span>
                    </div>
                    {weeks.map((week) => (
                        <div className="dw-calendar__row" key={week.key}>
                            <span className="dw-calendar__label">{week.label}</span>
                            <span className="dw-calendar__days">
                                {week.days.map((day) => (
                                    <span
                                        key={day.key}
                                        className={`dw-calendar__day${day.km > 0 ? " is-active" : ""}`}
                                        style={day.km > 0 ? { opacity: 0.62 + (day.km / peak) * 0.38 } : undefined}
                                        title={day.km > 0 ? `${day.key}: ${day.km.toFixed(1)} km` : `${day.key}: rest`}
                                    />
                                ))}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="dw-legend-list">
                    <p className="dw-legend-row dw-legend-row--lead">
                        <span className="dw-dot" aria-hidden="true" />
                        <span>Weeks active</span>
                        <strong>{activeWeeks} / {totalWeeks}</strong>
                    </p>
                    <p className="dw-legend-row">
                        <span className="dw-dot" aria-hidden="true" />
                        <span>Runs logged</span>
                        <strong>{fourWeekRuns}</strong>
                    </p>
                    <p className="dw-legend-row">
                        <span className="dw-dot dw-dot--muted" aria-hidden="true" />
                        <span>Weekly average</span>
                        <strong>{fourWeekAverage.toFixed(1)} km</strong>
                    </p>
                    <p className="dw-legend-row">
                        <span className="dw-dot dw-dot--muted" aria-hidden="true" />
                        <span>Best week</span>
                        <strong>{bestWeek.toFixed(1)} km</strong>
                    </p>
                </div>
            </div>
        </section>
    );
};

const ShareCard = ({ weeks, max }) => {
    const reduceMotion = useReducedMotion();
    const total = weeks.reduce((sum, week) => sum + week.km, 0);
    const average = weeks.length ? total / weeks.length : 0;
    const averagePercent = max > 0 ? Math.min((average / max) * 100, 100) : 0;

    return (
        <section className="dw-card dw-share" aria-labelledby="share-title">
            <div className="dw-card__head">
                <h2 id="share-title" className="dw-card__title">Distance distribution</h2>
                <p className="dw-card__meta">Avg {average.toFixed(1)} km</p>
            </div>

            <div className="dw-share__body">
                {weeks.map((week, index) => {
                    const share = total > 0 ? (week.km / total) * 100 : 0;

                    return (
                        <div className="dw-share-row" key={week.key}>
                            <span className="dw-share-row__label">
                                {index === weeks.length - 1 ? "This week" : week.label}
                            </span>
                            <span className="dw-share-row__track">
                                <motion.span
                                    className="dw-share-row__fill"
                                    initial={reduceMotion ? false : { width: 0 }}
                                    animate={{ width: `${Math.min((week.km / max) * 100, 100)}%` }}
                                    transition={{
                                        duration: 0.7,
                                        delay: reduceMotion ? 0 : 0.15 + index * 0.07,
                                        ease: EASE_OUT
                                    }}
                                />
                                <span
                                    className="dw-share-row__avg"
                                    style={{ left: `${averagePercent}%` }}
                                    aria-hidden="true"
                                />
                            </span>
                            <span className="dw-share-row__value">{week.km.toFixed(1)} km</span>
                            <span className="dw-share-row__share">{share.toFixed(0)}%</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const PlanCard = ({
    planPhase,
    focusWeek,
    planStatus,
    planSessions,
    totalWeeks,
    focusTarget,
    currentKm,
    progress,
    onOpenPlan
}) => {
    const tagTone = planPhase === "active"
        ? " dw-tag--green"
        : planPhase === "upcoming"
            ? " dw-tag--blue"
            : " dw-tag--grey";

    return (
        <section className="dw-card dw-plan" aria-labelledby="plan-title">
            <div className="dw-card__head">
                <div>
                    <h2 id="plan-title" className="dw-card__title">Training plan</h2>
                    {focusWeek && <p className="dw-plan__phase">{focusWeek.phase}</p>}
                </div>
                <span className={`dw-tag${tagTone}`}>{planStatus}</span>
            </div>

            {focusWeek ? (
                <>
                    <div className="dw-plan__stats">
                        <div className="dw-plan__stat">
                            <p className="dw-plan__stat-label">Week</p>
                            <p className="dw-plan__stat-value">
                                {focusWeek.week_number}<span>of {totalWeeks}</span>
                            </p>
                        </div>
                        <div className="dw-plan__stat">
                            <p className="dw-plan__stat-label">Volume</p>
                            <p className="dw-plan__stat-value">
                                {focusTarget}<span>km</span>
                            </p>
                        </div>
                        <div className="dw-plan__stat">
                            <p className="dw-plan__stat-label">Sessions</p>
                            <p className="dw-plan__stat-value">{planSessions}</p>
                        </div>
                    </div>

                    {progress !== null && (
                        <div className="dw-progress">
                            <div className="dw-progress__label">
                                <span>Week progress</span>
                                <span>{currentKm.toFixed(1)} / {focusTarget} km</span>
                            </div>
                            <div className="dw-progress__track">
                                <motion.span
                                    className="dw-progress__fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.8, ease: EASE_OUT }}
                                />
                            </div>
                        </div>
                    )}

                    <button type="button" className="dw-text-button dw-card__link" onClick={onOpenPlan}>
                        View full plan
                        <ChevronRight aria-hidden="true" />
                    </button>
                </>
            ) : (
                <div className="dw-plan__empty">
                    <strong>Build your first training block</strong>
                    <p>Turn your recent mileage into a week-by-week schedule built around your life.</p>
                    <button type="button" className="dw-btn dw-btn--dark" onClick={onOpenPlan}>
                        Build a plan
                    </button>
                </div>
            )}
        </section>
    );
};

const RunsChartCard = ({ weeks, max }) => {
    const reduceMotion = useReducedMotion();

    return (
        <section className="dw-card dw-runs-card" aria-labelledby="runs-chart-title">
            <div className="dw-card__head">
                <h2 id="runs-chart-title" className="dw-card__title">Runs per week</h2>
                <p className="dw-card__meta">Last 4 weeks</p>
            </div>

            <div className="dw-runbars">
                {weeks.map((week, index) => {
                    const percentage = week.runs > 0 ? Math.max((week.runs / max) * 100, 7) : 0;

                    return (
                        <div
                            className={`dw-runbar${index === weeks.length - 1 ? " is-current" : ""}`}
                            key={week.key}
                        >
                            <div className="dw-runbar__plot">
                                <span
                                    className="dw-runbar__value"
                                    style={{ bottom: `calc(${percentage}% + 4px)` }}
                                >
                                    {week.runs}
                                </span>
                                <motion.span
                                    className="dw-runbar__fill"
                                    initial={reduceMotion ? false : { scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{
                                        duration: 0.6,
                                        delay: reduceMotion ? 0 : 0.2 + index * 0.07,
                                        ease: EASE_OUT
                                    }}
                                    style={{ height: `${percentage}%`, transformOrigin: "bottom" }}
                                />
                            </div>
                            <span className="dw-runbar__label">
                                {week.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

const BestsCard = ({ fastest5K, fastest10K, longestRun }) => (
    <section className="dw-card dw-bests" aria-labelledby="bests-title">
        <div className="dw-card__head">
            <h2 id="bests-title" className="dw-card__title">Personal bests</h2>
            <p className="dw-card__meta">All synced runs</p>
        </div>

        <div className="dw-pb-list">
            <PbRow
                label="5K"
                value={fastest5K ? formatClock(fastest5K.round) : "No effort"}
                meta={formatPBDate(fastest5K?.start_date_local)}
            />
            <PbRow
                label="10K"
                value={fastest10K ? formatClock(fastest10K.round) : "No effort"}
                meta={formatPBDate(fastest10K?.start_date_local)}
            />
            <PbRow
                label="Longest"
                value={longestRun ? `${(Number(longestRun.distance) / 1000).toFixed(1)} km` : "No effort"}
                meta={formatPBDate(longestRun?.start_date_local)}
            />
        </div>
    </section>
);

const PbRow = ({ label, value, meta }) => {
    const isEmpty = value === "No effort";

    return (
        <div className="dw-pb-row">
            <div>
                <p className="dw-pb__label">{label}</p>
                <p className="dw-pb__date">{meta}</p>
            </div>
            <p className={`dw-pb__value${isEmpty ? " dw-pb__value--empty" : ""}`}>{value}</p>
        </div>
    );
};

const RunsTable = ({ runs, totalRuns }) => (
    <div className="dw-table" role="table" aria-label="Your five latest runs">
        <div className="dw-table__head" role="row">
            <span role="columnheader">Run</span>
            <span role="columnheader">Type</span>
            <span role="columnheader">Distance</span>
            <span role="columnheader">Pace /km</span>
            <span role="columnheader">Time</span>
        </div>

        {runs.length === 0 ? (
            <div className="dw-empty">
                <strong>No runs yet</strong>
                <p>Sync Strava to pull in your latest activities.</p>
            </div>
        ) : (
            runs.map((run, index) => {
                const key = dayKey(run.start_date_local);

                return (
                    <div className="dw-table__row" role="row" key={run.id ?? `${key}-${index}`}>
                        <div className="dw-run__who" role="cell">
                            <span className="dw-run__badge" aria-hidden="true">{key.slice(8, 10)}</span>
                            <div>
                                <p className="dw-run__date">{formatShortDay(key)}</p>
                                <p className="dw-run__meta">
                                    {Math.round(Number(run.total_elevation_gain ?? 0))} m climb
                                </p>
                            </div>
                        </div>
                        <div className="dw-table__cell" role="cell" data-label="Type">
                            <span className={`dw-pill dw-pill--${runTypeTone(run.workout_type)}`}>
                                {runTypeLabel(run.workout_type)}
                            </span>
                        </div>
                        <div className="dw-table__cell" role="cell" data-label="Distance">
                            {formatKm(run.distance)}
                        </div>
                        <div className="dw-table__cell" role="cell" data-label="Pace">
                            {formatPaceFromSpeed(run.average_speed)}
                        </div>
                        <div className="dw-table__cell" role="cell" data-label="Time">
                            {formatRunDuration(run.moving_time)}
                        </div>
                    </div>
                );
            })
        )}

        <div className="dw-table__foot">
            <span>{runs.length} of {totalRuns} runs shown</span>
            <span>Synced from Strava</span>
        </div>
    </div>
);

const SessionsCard = ({ sessions, today, onOpenPlan }) => (
    <section className="dw-card dw-sessions" aria-labelledby="sessions-title">
        <div className="dw-card__head">
            <h2 id="sessions-title" className="dw-card__title">Upcoming sessions</h2>
            <button type="button" className="dw-text-button" onClick={onOpenPlan}>
                View plan
                <ChevronRight aria-hidden="true" />
            </button>
        </div>

        {sessions.length > 0 ? (
            <div className="dw-sessions__list">
                {sessions.map((session) => {
                    const state = sessionState(session.date, today);
                    const distance = Number(session.distance_km);

                    return (
                        <div className="dw-session" key={`${session.weekNumber}-${session.date}`}>
                            <span className="dw-session__icon" aria-hidden="true">
                                <CalendarDays />
                            </span>
                            <div className="dw-session__body">
                                <p className="dw-session__title">{session.workout_type}</p>
                                <p className="dw-session__meta">
                                    {formatShortDay(session.date)}
                                    {distance > 0 ? ` · ${distance.toFixed(1)} km` : ""}
                                </p>
                            </div>
                            <span className={`dw-pill dw-pill--${state.tone}`}>{state.label}</span>
                        </div>
                    );
                })}
            </div>
        ) : (
            <div className="dw-session__empty">
                <strong>Nothing scheduled yet</strong>
                <p>Your next planned sessions will appear here once your training block starts.</p>
                <button type="button" className="dw-text-button" onClick={onOpenPlan}>
                    View training plan
                    <ChevronRight aria-hidden="true" />
                </button>
            </div>
        )}
    </section>
);

const Bone = ({ className = "" }) => <span className={`dw-bone ${className}`} aria-hidden="true" />;

const DashboardSkeleton = () => (
    <div className="dw-skeleton" aria-hidden="true">
        <div className="dw-skeleton__kpis">
            {[...Array(4)].map((_, index) => (
                <div className="dw-card dw-kpi" key={index}>
                    <Bone className="dw-bone--icon" />
                    <div className="dw-kpi__body">
                        <Bone className="dw-bone--label" />
                        <Bone className="dw-bone--value" />
                        <Bone className="dw-bone--hint" />
                    </div>
                </div>
            ))}
        </div>

        <div className="dw-grid">
            <div className="dw-card dw-volume dw-skeleton__card--volume">
                <Bone className="dw-bone--title" />
                <Bone className="dw-bone--chart" />
            </div>

            <div className="dw-skeleton__rail">
                <div className="dw-card dw-skeleton__card">
                    <Bone className="dw-bone--title" />
                    <Bone className="dw-bone--ring" />
                </div>
                <div className="dw-card dw-skeleton__card">
                    <Bone className="dw-bone--title" />
                    {[...Array(3)].map((_, index) => (
                        <Bone className="dw-bone--row" key={index} />
                    ))}
                </div>
            </div>

            {[...Array(3)].map((_, index) => (
                <div className="dw-card dw-skeleton__card dw-plan" key={index}>
                    <Bone className="dw-bone--title" />
                    {[...Array(3)].map((__, row) => (
                        <Bone className="dw-bone--row" key={row} />
                    ))}
                </div>
            ))}

            <div className="dw-card dw-skeleton__card dw-recent">
                <Bone className="dw-bone--title" />
                {[...Array(5)].map((_, index) => (
                    <Bone className="dw-bone--row" key={index} />
                ))}
            </div>
            <div className="dw-card dw-skeleton__card dw-sessions">
                <Bone className="dw-bone--title" />
                {[...Array(5)].map((_, index) => (
                    <Bone className="dw-bone--row" key={index} />
                ))}
            </div>
        </div>
    </div>
);
