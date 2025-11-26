interface Quest {
  title: string;
  progress: number;
  target: number;
}

interface Props {
  quests: Quest[];
}

const QuestList = ({ quests }: Props) => (
  <div className="space-y-3">
    {quests.map((quest) => {
      const pct = Math.min((quest.progress / quest.target) * 100, 100);
      return (
        <div key={quest.title}>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{quest.title}</span>
            <span>
              {quest.progress}/{quest.target}
            </span>
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
    })}
  </div>
);

export default QuestList;

