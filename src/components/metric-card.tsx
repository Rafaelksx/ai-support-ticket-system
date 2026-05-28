import { Card, CardContent } from '@/components/ui/card';
import { type LucideIcon } from 'lucide-react';

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: number;
}) {
  return (
    <Card className="border-slate-700 bg-slate-800/30 backdrop-blur">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {trend !== undefined && (
              <p className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs última semana
              </p>
            )}
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Icon className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
