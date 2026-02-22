import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-6">
          <a href="/" className="text-xl font-semibold text-gray-900">
            🌳 icp-gramps
          </a>
          <a href="/persons" className="text-gray-600 hover:text-gray-900">
            Persons
          </a>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  ),
});
