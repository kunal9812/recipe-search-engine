"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useDebounce } from "@/lib/useDebounce";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // The ingredient currently being typed is whatever follows the last comma
  const segments = value.split(",");
  const currentTerm = segments[segments.length - 1].trim();
  const debouncedTerm = useDebounce(currentTerm, 250);

  useEffect(() => {
    if (!debouncedTerm) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;

    fetch(`/api/ingredients?q=${encodeURIComponent(debouncedTerm)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const next: string[] = data.suggestions ?? [];
        setSuggestions(next);
        setOpen(next.length > 0);
        setActiveIndex(-1);
      })
      .catch(() => {
        if (!cancelled) {
          setSuggestions([]);
          setOpen(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedTerm]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function applySuggestion(suggestion: string) {
    const parts = value.split(",");
    parts[parts.length - 1] = ` ${suggestion}`;
    const rebuilt = parts
      .map((p, i) => (i === 0 ? p.trim() : p))
      .join(",");
    onChange(`${rebuilt}, `);
    setOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      applySuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="search-bar" ref={containerRef}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="chicken, paneer, lentils…"
        className="search-bar__input"
        autoFocus
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && (
        <ul className="search-bar__suggestions" role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s}
              role="option"
              aria-selected={i === activeIndex}
              className={
                i === activeIndex
                  ? "search-bar__suggestion search-bar__suggestion--active"
                  : "search-bar__suggestion"
              }
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(s);
              }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
