'use client';
import { useEffect, useRef } from 'react';
import { type LucideIcon } from 'lucide-react';

function useCountUp(target: number, duration = 1000) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof target !== 'number') return;
    const el = ref.current;
    if (!el) return;

    let startTime: number | null = null;
    const startVal = 0;

    function step(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      el!.textContent = Math.floor(startVal + (target - startVal) * ease).toString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration]);

  return ref;
}

const iconGradients: Record<string, { from: string; to: string; glow: string }> = {
  default:  { from: 'from-indigo-500',  to: 'to-purple-500',  glow: 'shadow-indigo-500/20' },
  success:  { from: 'from-emerald-500', to: 'to-teal-500',    glow: 'shadow-emerald-500/20' },
  warning:  { from: 'from-amber-500',   to: 'to-orange-500',  glow: 'shadow-amber-500/20' },
  danger:   { from: 'from-rose-500',    to: 'to-red-500',     glow: 'shadow-rose-500/20' },
  info:     { from: 'from-sky-500',     to: 'to-blue-500',    glow: 'shadow-sky-500/20' },
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'default',
  staggerIndex = 0,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
  color?: keyof typeof iconGradients;
  staggerIndex?: number;
}) {
  const isNumeric = typeof value === 'number';
  const countRef = useCountUp(isNumeric ? value : 0);
  const grad = iconGradients[color] ?? iconGradients.default;
  const delayClass = ['delay-0','delay-100','delay-200','delay-300','delay-400'][staggerIndex] ?? 'delay-0';

  return (
    <div
      className={`group relative rounded-2xl p-px animate-fade-up ${delayClass} overflow-hidden`}
      style={{ animationFillMode: 'both' }}
    >
      {/* Gradient border */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${grad.from} ${grad.to} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
      />

      {/* Card body */}
      <div className="relative rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/[0.07] p-5 h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:border-white/[0.12]">
        <div className="flex items-start justify-between gap-3">
          {/* Left — text */}
          <div className="space-y-1 min-w-0">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest truncate">
              {title}
            </p>
            <p className="text-3xl font-bold text-white tabular-nums leading-none">
              {isNumeric ? <span ref={countRef}>0</span> : value}
            </p>
            {trend !== undefined && (
              <p
                className={`text-xs font-semibold flex items-center gap-1 ${
                  trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-slate-500'
                }`}
              >
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
                <span>{Math.abs(trend)}% vs semana pasada</span>
              </p>
            )}
          </div>

          {/* Right — icon */}
          <div
            className={`shrink-0 p-3 rounded-xl bg-gradient-to-br ${grad.from}/10 ${grad.to}/10 border border-white/[0.06] shadow-lg ${grad.glow} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className={`w-5 h-5 bg-gradient-to-br ${grad.from} ${grad.to} [&>*]:fill-current`} strokeWidth={1.75} style={{ color: 'white' }} />
          </div>
        </div>

        {/* Bottom accent bar */}
        <div className="mt-4 h-px w-full bg-white/[0.04]" />
        <div
          className={`mt-0 h-px bg-gradient-to-r ${grad.from} ${grad.to} opacity-40 group-hover:opacity-80 transition-all duration-500 rounded-full`}
          style={{ width: '60%' }}
        />
      </div>
    </div>
  );
}
