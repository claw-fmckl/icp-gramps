import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to icp-gramps
      </h1>
      <p className="text-gray-600">
        A decentralized genealogy application on the Internet Computer.
      </p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Persons" count={0} href="/persons" />
        <StatCard label="Families" count={0} href="/families" />
        <StatCard label="Events" count={0} href="/events" />
      </div>
    </div>
  );
}

function StatCard({
  label,
  count,
  href,
}: {
  label: string;
  count: number;
  href: string;
}) {
  return (
    <a
      href={href}
      className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
    >
      <div className="text-3xl font-bold text-blue-600">{count}</div>
      <div className="text-gray-600 mt-1">{label}</div>
    </a>
  );
}
