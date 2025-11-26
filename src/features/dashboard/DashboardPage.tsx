import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import ModuleCard from '../../components/ModuleCard';
import StatCard from '../../components/StatCard';
import Heatmap from '../../components/Heatmap';
import { useDashboard } from '../../api/hooks';
import api from '../../api/client';

const DashboardPage = () => {
  const { data, isLoading } = useDashboard();
  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data } = await api.get('/gamification/leaderboard');
      return data as Array<{ rank: number; full_name: string; xp: number }>;
    }
  });

  if (isLoading || !data) {
    return <p className="text-slate-400">Loading dashboard...</p>;
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard label="XP" value={data.xp.toLocaleString()} sublabel="All-time" />
        <StatCard label="Coins" value={data.coins} sublabel="Spend on boosts" />
        <StatCard label="Streak" value={`${data.streak} days`} sublabel="Keep it alive!" />
        <StatCard label="Level" value={data.level} sublabel="Gamified mastery" />
      </div>

      <section className="rounded-3xl border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Study Heatmap</h2>
            <p className="text-sm text-slate-400">Track active minutes in the last month.</p>
          </div>
        </div>
        <Heatmap data={data.heatmap} />
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <ModuleCard
          title="Weak Skills"
          description="Strengthen priority areas with AI tips."
          action={
            <ul className="text-sm text-slate-300">
              {data.weak_skills.map((skill) => (
                <li key={skill.skill}>
                  {skill.skill}: {skill.score.toFixed(1)}
                </li>
              ))}
            </ul>
          }
        />
        <ModuleCard
          title="AI Study Plan"
          description="Tailored micro tasks for the next sprint."
          action={
            <ul className="text-sm text-slate-300 list-disc ml-4">
              {data.study_plan.map((task) => (
                <li key={task}>{task}</li>
              ))}
            </ul>
          }
        />
      </section>

      <section className="grid md:grid-cols-4 gap-4">
        <ModuleCard
          title="Reading Arena"
          description="Mock passages, highlights, flashcards."
          action={
            <Link to="/reading" className="px-3 py-2 rounded-full border border-primary text-sm">
              Start reading
            </Link>
          }
        />
        <ModuleCard
          title="Dictation Studio"
          description="Daily listening drills with hints + XP."
          action={
            <Link to="/listening" className="px-3 py-2 rounded-full border border-primary text-sm">
              Launch dictation
            </Link>
          }
        />
        <ModuleCard
          title="Speaking Coach"
          description="Roleplay, SpeechAce scoring, AI fixes."
          action={
            <Link to="/speaking" className="px-3 py-2 rounded-full border border-primary text-sm">
              Practice
            </Link>
          }
        />
        <div className="rounded-3xl border border-slate-800 p-6">
          <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>
          <ol className="space-y-2 text-sm">
            {leaderboard?.map((row) => (
              <li key={row.rank} className="flex justify-between">
                <span>
                  #{row.rank} {row.full_name}
                </span>
                <span>{row.xp} XP</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

