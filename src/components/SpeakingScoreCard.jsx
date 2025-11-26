const Metric = ({ label, value, unit = '%' }) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
    <p className="text-xs uppercase text-slate-500">{label}</p>
    <p className="text-3xl font-semibold">{value ?? '--'}{value !== undefined ? unit : ''}</p>
  </div>
);

const SpeakingScoreCard = ({ result }) => {
  if (!result) return null;
  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Metric label="Accuracy" value={result.accuracy?.toFixed?.(1) ?? result.accuracy} />
      <Metric label="Fluency" value={result.fluency?.toFixed?.(1) ?? result.fluency} />
      <Metric label="Completeness" value={result.completeness?.toFixed?.(1) ?? result.completeness} />
      <div className="rounded-2xl border border-primary/40 bg-primary/10 p-4">
        <p className="text-xs uppercase text-slate-500">IELTS Band</p>
        <p className="text-3xl font-semibold">{result.band?.toFixed?.(1) ?? result.band}</p>
      </div>
    </div>
  );
};

export default SpeakingScoreCard;





