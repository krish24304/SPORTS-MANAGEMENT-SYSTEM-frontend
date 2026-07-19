type StatsCardProps = {
  title: string;
  value: string;
};

export default function StatsCard({
  title,
  value,
}: StatsCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

      <p className="text-gray-400 mb-3">
        {title}
      </p>

      <h2 className="text-4xl font-bold">
        {value}
      </h2>

    </div>
  );
}