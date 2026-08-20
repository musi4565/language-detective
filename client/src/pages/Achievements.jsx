import { useState, useEffect } from "react";
import { Trophy, Lock } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function Achievements() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/progress/stats")
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16 text-brand-600"><Spinner size={28} /></div>;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const achievements = data.achievements || [];
  const ownedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Achievements</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          You've unlocked <b>{ownedCount}</b> of <b>{achievements.length}</b> achievements.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) =>
          a.unlocked ? (
            <div key={a.id} className="card flex items-start gap-4 border-emerald-500/30">
              <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-500">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-bold">{a.title}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{a.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge-amber">+{a.xpReward} XP</span>
                  {a.unlockedAt && <span className="text-[10px] text-slate-400">Unlocked {new Date(a.unlockedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          ) : (
            <div key={a.id} className="card flex items-start gap-4 opacity-60">
              <div className="rounded-xl bg-slate-100 p-3 text-slate-400 dark:bg-slate-700">
                <Lock className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-bold">{a.title}</p>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{a.description}</p>
                <span className="badge-slate mt-2">Locked</span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}