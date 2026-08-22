import { Sparkles } from "lucide-react";

export default function EmptyState({ title = "Nothing here yet", description, icon: Icon = Sparkles, cta, onCta }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-600">
      <div className="rounded-2xl bg-brand-50 p-4 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {cta && onCta && (
        <button onClick={onCta} className="btn-primary mt-2">
          {cta}
        </button>
      )}
    </div>
  );
}