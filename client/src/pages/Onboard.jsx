import { useState } from "react";
import HeroBackground from "../components/ui/hero-background";

const STEPS = ["About you", "Goals", "Schedule", "Health"];

const emptyForm = {
  athlete: { name: "", age: "", sex: "", height_cm: "", weight_kg: "", years_running: "" },
  goals: { primary_goal: "", goal_race_date: "", goal_time: "", duration_weeks: 12, start_date: "" },
  availability: { days_per_week: 4, preferred_rest_day: "Monday", max_time_weekday_min: 60, max_time_weekend_min: 120, strength_training_days: [] },
  injuries: { current_injury: false, past_injuries: [] },
};

function Onboard() {

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  const patch = (section, key, value) => {
    setForm(f => ({ ...f, [section]: { ...f[section], [key]: value } }));
  };

  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/onboard`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      

      if (response.ok) {
        // const data = await response.json();
        window.location.href = "/dashboard"; // todo - dashbaord is pending
      }

      if (response.status === 401) {
        localStorage.setItem("pendingOnboard", JSON.stringify(form));
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/strava`;
      }
    } catch (error) {
      console.error('Error submitting onboard form:', error);
      alert('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:border-white/30 focus:bg-white/[0.04]";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <HeroBackground />

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full max-w-xl">
          <div className="border border-white/[0.06] bg-[#0A0A0A]">

            <div className="px-8 pt-8 pb-8">
              <div className="mb-8 flex items-center justify-between">
                <span className="text-sm font-bold uppercase tracking-[0.2em] text-white/90">Endurio</span>
                <span className="text-xs text-white/25">Step {step + 1} of {STEPS.length}</span>
              </div>

              <div className="mb-10 flex items-center justify-center gap-0">
                {STEPS.map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-500 ${i <= step ? "bg-white text-black" : "bg-white/[0.06] text-white/25"}`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    {i < STEPS.length - 1 && <div className={`mx-2 h-px w-10 transition-all duration-500 ${i < step ? "bg-white/50" : "bg-white/[0.06]"}`} />}
                  </div>
                ))}
              </div>

              <div className="mb-8 text-center">
                <h2 className="text-xl font-semibold tracking-tight text-white">{STEPS[step]}</h2>
                <p className="mt-1.5 text-sm text-white/30">
                  {["Let's get to know you", "What are you training for", "When do you have time to run", "Any injuries or limitations"][step]}
                </p>
              </div>

              {step === 0 && (
                <div key={step} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Name</label>
                      <input className={inputClass} placeholder="Your name" value={form.athlete.name} onChange={e => patch("athlete", "name", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Age</label>
                      <input className={inputClass} type="number" placeholder="28" value={form.athlete.age} onChange={e => patch("athlete", "age", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Sex</label>
                      <select className={inputClass} value={form.athlete.sex} onChange={e => patch("athlete", "sex", e.target.value)}>
                        <option value="" disabled>Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Height (cm)</label>
                      <input className={inputClass} type="number" placeholder="175" value={form.athlete.height_cm} onChange={e => patch("athlete", "height_cm", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Weight (kg)</label>
                      <input className={inputClass} type="number" placeholder="68" value={form.athlete.weight_kg} onChange={e => patch("athlete", "weight_kg", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Years running</label>
                      <input className={inputClass} type="number" placeholder="3" value={form.athlete.years_running} onChange={e => patch("athlete", "years_running", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div key={step} className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Primary goal</label>
                    <select className={inputClass} value={form.goals.primary_goal} onChange={e => patch("goals", "primary_goal", e.target.value)}>
                      <option value="" disabled>Select goal</option>
                      <option>5K</option>
                      <option>10K</option>
                      <option>Half Marathon</option>
                      <option>Marathon</option>
                      <option>General Fitness</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Race date</label>
                      <input className={inputClass} type="date" value={form.goals.goal_race_date} onChange={e => patch("goals", "goal_race_date", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Goal time</label>
                      <input className={inputClass} placeholder="01:40:00" value={form.goals.goal_time} onChange={e => patch("goals", "goal_time", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Weeks</label>
                      <input className={inputClass} type="number" value={form.goals.duration_weeks} onChange={e => patch("goals", "duration_weeks", +e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Start date</label>
                      <input className={inputClass} type="date" value={form.goals.start_date} onChange={e => patch("goals", "start_date", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div key={step} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Days per week</label>
                      <input className={inputClass} type="number" min={3} max={7} value={form.availability.days_per_week} onChange={e => patch("availability", "days_per_week", +e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Rest day</label>
                      <select className={inputClass} value={form.availability.preferred_rest_day} onChange={e => patch("availability", "preferred_rest_day", e.target.value)}>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(d => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Max weekday (min)</label>
                      <input className={inputClass} type="number" value={form.availability.max_time_weekday_min} onChange={e => patch("availability", "max_time_weekday_min", +e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Max weekend (min)</label>
                      <input className={inputClass} type="number" value={form.availability.max_time_weekend_min} onChange={e => patch("availability", "max_time_weekend_min", +e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-medium tracking-wider text-white/40 uppercase">Strength training days</label>
                    <div className="flex flex-wrap gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => {
                        const isSelected = form.availability.strength_training_days.includes(d);
                        return (
                          <button key={d} type="button" onClick={() => {
                            const days = form.availability.strength_training_days;
                            patch("availability", "strength_training_days", days.includes(d) ? days.filter(x => x !== d) : [...days, d]);
                          }}
                            className={`border px-3 py-1.5 text-xs transition ${isSelected ? "border-white/40 bg-white/10 text-white" : "border-white/[0.08] text-white/40 hover:border-white/[0.15]"}`}>
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div key={step} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => patch("injuries", "current_injury", !form.injuries.current_injury)}
                      className={`h-5 w-5 border transition-all flex items-center justify-center ${form.injuries.current_injury ? "border-white bg-white/15" : "border-white/[0.12] hover:border-white/[0.25]"}`}>
                      {form.injuries.current_injury && <span className="text-white text-xs">&#10003;</span>}
                    </button>
                    <span className="text-sm text-white/70">Current injury</span>
                  </div>

                  {form.injuries.past_injuries.map((item, i) => (
                    <div key={i} className="grid grid-cols-3 gap-3">
                      <input className={inputClass} placeholder="Injury" value={item.injury} onChange={e => {
                        const list = [...form.injuries.past_injuries];
                        list[i] = { ...list[i], injury: e.target.value };
                        setForm(f => ({ ...f, injuries: { ...f.injuries, past_injuries: list } }));
                      }} />
                      <input className={inputClass} type="number" placeholder="Year" value={item.year} onChange={e => {
                        const list = [...form.injuries.past_injuries];
                        list[i] = { ...list[i], year: e.target.value };
                        setForm(f => ({ ...f, injuries: { ...f.injuries, past_injuries: list } }));
                      }} />
                      <select className={inputClass} value={item.severity} onChange={e => {
                        const list = [...form.injuries.past_injuries];
                        list[i] = { ...list[i], severity: e.target.value };
                        setForm(f => ({ ...f, injuries: { ...f.injuries, past_injuries: list } }));
                      }}>
                        <option value="">Severity</option>
                        <option value="mild">Mild</option>
                        <option value="moderate">Moderate</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                  ))}

                  <button type="button" onClick={() => {
                    const updated = { ...form.injuries, past_injuries: [...form.injuries.past_injuries, { injury: "", year: "", severity: "" }] };
                    setForm(f => ({ ...f, injuries: updated }));
                  }}
                    className="text-xs text-white/50 transition hover:text-white">
                    + Add past injury
                  </button>
                </div>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button onClick={prev} disabled={step === 0}
                  className="border border-white/[0.08] px-5 py-2.5 text-sm text-white/40 transition hover:border-white/[0.15] hover:text-white/70 disabled:opacity-20">
                  ← Back
                </button>

                {step < STEPS.length - 1 ? (
                  <button onClick={next}
                    className="bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 active:scale-[0.97]">
                    Next →
                  </button>
                ) : (
                  <button onClick={submit} disabled={loading}
                    className="bg-white px-6 py-2.5 text-sm font-medium text-black transition hover:bg-white/90 active:scale-[0.97] disabled:opacity-50">
                    {loading ? "Saving..." : "Finish →"}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Onboard;
