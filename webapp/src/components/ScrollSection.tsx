export default function ScrollSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-8">
      <h2 className="mb-3 px-4 text-base font-bold">{title}</h2>
      <div className="flex gap-3 overflow-x-auto px-4 pb-1">{children}</div>
    </div>
  );
}
