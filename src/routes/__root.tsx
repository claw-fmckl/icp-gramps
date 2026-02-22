import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useActor } from "../hooks/useActor";
import type { Person } from "../declarations/icp-gramps";

function SearchBar() {
  const actor = useActor();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const searchResults = await actor.search_persons(query);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, actor]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (handle: string) => {
    window.location.href = `/persons/${handle}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <div ref={searchRef} className="relative ml-auto">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search persons..."
        className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isOpen && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            results.map((person) => (
              <button
                key={person.handle}
                onClick={() => handleResultClick(person.handle)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
              >
                <span className="font-medium">
                  {person.given_names} {person.surname}
                </span>
                <span className="text-sm text-gray-500">{person.gramps_id}</span>
              </button>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

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
          <a href="/families" className="text-gray-600 hover:text-gray-900">
            Families
          </a>
          <a href="/places" className="text-gray-600 hover:text-gray-900">
            Places
          </a>
          <SearchBar />
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  ),
});
