interface Props {
  data: { date: string; minutes: number }[];
}

const Heatmap = ({ data }: Props) => (
  <div className="grid grid-cols-7 gap-1">
    {data.map((point) => (
      <div
        key={point.date}
        title={`${point.date} · ${point.minutes}m`}
        className="h-4 rounded-sm"
        style={{
          backgroundColor:
            point.minutes === 0
              ? '#1f2937'
              : `rgba(99,91,255,${Math.min(point.minutes / 60, 1)})`
        }}
      />
    ))}
  </div>
);

export default Heatmap;

