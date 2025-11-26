interface Props {
  title: string;
  description: string;
  action: React.ReactNode;
}

const ModuleCard = ({ title, description, action }: Props) => (
  <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </div>
    {action}
  </div>
);

export default ModuleCard;

