import { useEffect, useRef, useState } from "react";

type Item = { _id: string; nameEn: string };

export default function SearchableDropdown({
  items,
  value,
  onChange,
  placeholder = "Search..."
}: {
  items: Item[];
  value: string;
  onChange: (id: string, label?: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement | null>(null);

  const filtered = items.filter(i =>
    i.nameEn.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => setHighlight(0), [query]);

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filtered[highlight];
      if (item) onChange(item._id, item.nameEn);
      setOpen(false);
      setQuery("");
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={ref} className="relative w-full">
      <div
        className="flex items-center gap-2 p-2 bg-white rounded-lg border shadow-sm cursor-pointer"
        onClick={() => { setOpen(v => !v); setTimeout(() => ref.current?.querySelector<HTMLInputElement>("input")?.focus(), 0); }}
      >
        <input
          aria-label={placeholder}
          value={query || (value ? items.find(i => i._id === value)?.nameEn || "" : "")}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onKeyDown={onKey}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none px-1 text-black"
        />
        {value && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(""); setQuery(""); }}
            className="text-sm text-gray-600 hover:text-gray-800"
            title="Clear"
          >
            ✕
          </button>
        )}
        <div className="text-gray-400 ml-1">▾</div>
      </div>

      <div
        className={`absolute z-30 mt-2 w-full bg-white rounded-lg shadow-lg border overflow-hidden transition transform origin-top ${
          open ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-95"
        }`}
      >
        <div className="max-h-48 overflow-auto scrollbar-thin scrollbar-thumb-gray-300">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-black">No results</div>
          ) : (
            filtered.map((it, i) => {
              const active = i === highlight;
              return (
                <div
                  key={it._id}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => { onChange(it._id, it.nameEn); setOpen(false); setQuery(""); }}
                  role="button"
                  tabIndex={0}
                  className={`px-3 py-2 cursor-pointer flex items-center justify-between text-black ${
                    active ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-100"
                  }`}
                >
                  <div>
                    <div className="font-medium ">{it.nameEn}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}