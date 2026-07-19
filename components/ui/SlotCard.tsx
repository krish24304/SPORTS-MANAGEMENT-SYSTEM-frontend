type SlotCardProps = {
  time: string;
  available: boolean;
  selected: boolean;
  onClick: () => void;
};

export default function SlotCard({
  time,
  available,
  selected,
  onClick,
}: SlotCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={`w-full p-5 rounded-2xl border transition-all duration-300 text-left
      ${
        selected
          ? "border-white bg-white text-black"
          : available
          ? "border-zinc-700 bg-zinc-900 text-white hover:border-zinc-500"
          : "border-zinc-800 bg-zinc-950 text-zinc-600 cursor-not-allowed"
      }`}
    >

      <h2 className="text-xl font-bold mb-2">
        {time}
      </h2>

      <p className="text-sm">
        {available ? "Available" : "Booked"}
      </p>

    </button>
  );
}