type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-600 transition-all duration-300">
      <h2 className="text-2xl font-semibold mb-3">
        {title}
      </h2>

      <p className="text-gray-400">
        {description}
      </p>
    </div>
  );
}