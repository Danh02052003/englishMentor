interface Props {
  label: string;
  value: string | number;
  sublabel?: string;
}

const StatCard = ({ label, value, sublabel }: Props) => (
  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-3xl font-semibold mt-2">{value}</p>
    {sublabel && <p className="text-xs text-slate-500 mt-1">{sublabel}</p>}
  </div>
);

export default StatCard;

