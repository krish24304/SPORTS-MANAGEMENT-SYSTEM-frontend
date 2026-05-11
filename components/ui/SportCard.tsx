type SportCardProps = {
  name: string;
  totalGear: number;
  availableGear: number;
  status: string;
};

export default function SportCard({
  name,
  totalGear,
  availableGear,
  status,
}: SportCardProps) {
  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all duration-300">

      <h2 className="text-2xl font-bold mb-4">
        {name}
      </h2>

      <div className="space-y-2 text-gray-300">
        <p>Total Gear: {totalGear}</p>
        <p>Available Gear: {availableGear}</p>
        <p>
  Status:

  <span
    className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold
    ${
      status === "Available"
        ? "bg-green-500/20 text-green-400"
        : status === "Limited"
        ? "bg-yellow-500/20 text-yellow-300"
        : "bg-blue-500/20 text-blue-300"
    }`}
  >
    {status}
  </span>
</p>
      </div>

    </div>
  );
}