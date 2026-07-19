type SportCardProps = {
  name: string;
  courts: number;
  availableCourts: number;
};
export default function SportCard({
  name,
  courts,
  availableCourts,
}: SportCardProps) {
  const status =
    availableCourts > 0
      ? "Available"
      : "Full";
  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 hover:scale-[1.02] transition-all duration-300 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">
          {name}
        </h2>
        <div
          className={`px-4 py-2 rounded-full text-sm font-bold
          ${
            availableCourts > 0
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {status}
        </div>
      </div>
      <div className="space-y-4 text-zinc-300">
        <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-2xl">
          <span className="text-lg">
            Total Courts
          </span>
          <span className="text-2xl font-bold text-white">
            {courts}
          </span>
        </div>
        <div className="flex justify-between items-center bg-zinc-800/50 p-4 rounded-2xl">
          <span className="text-lg">
            Available Courts
          </span>
          <span className="text-2xl font-bold text-green-400">
            {availableCourts}
          </span>
        </div>
      </div>
    </div>

  );
}

