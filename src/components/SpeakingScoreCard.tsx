import type { SpeakingScoreResult } from '../api/speaking';

interface MetricProps {
  label: string;
  value?: number;
  unit?: string;
}

const Metric = ({ label, value, unit = '%' }: MetricProps) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="text-3xl font-semibold">
      {value ?? '--'}
      {value !== undefined ? unit : ''}
    </p>
  </div>
);

interface SpeakingScoreCardProps {
  result: SpeakingScoreResult | null;
}

const SpeakingScoreCard = ({ result }: SpeakingScoreCardProps) => {
  if (!result) return null;
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Metric label="Accuracy" value={result.accuracy ?? result.pronunciation} />
      <Metric label="Fluency" value={result.fluency ?? result.coherence} />
      <Metric label="Completeness" value={result.completeness ?? result.lexical} />
      <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
        <p className="text-xs uppercase text-slate-500">IELTS Band</p>
        <p className="text-3xl font-semibold">{result.band ?? result.overall_band ?? '--'}</p>
      </div>
    </div>
  );
};

export default SpeakingScoreCard;





