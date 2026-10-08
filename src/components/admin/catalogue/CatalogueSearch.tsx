import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Layers, Building, GraduationCap, BookOpen, ArrowRight } from 'lucide-react';
import { adminCatalogueService, CatalogueSearchResult } from '../../../services/adminCatalogueService';

interface CatalogueSearchProps {
  onSelectResult: (result: CatalogueSearchResult) => void;
}

export const CatalogueSearch: React.FC<CatalogueSearchProps> = ({ onSelectResult }) => {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<CatalogueSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search effect (300ms)
  useEffect(() => {
    if (!queryText.trim() || queryText.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const matches = await adminCatalogueService.searchCatalogue(queryText);
        setResults(matches);
        setIsOpen(true);
      } catch (err) {
        console.warn('CatalogueSearch failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [queryText]);

  const handleClear = () => {
    setQueryText('');
    setResults([]);
    setIsOpen(false);
  };

  const getIcon = (type: CatalogueSearchResult['type']) => {
    switch (type) {
      case 'unit':
        return <Layers className="h-4 w-4 text-sky-400" />;
      case 'department':
        return <Building className="h-4 w-4 text-purple-400" />;
      case 'programme':
        return <GraduationCap className="h-4 w-4 text-emerald-400" />;
      case 'course':
        return <BookOpen className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={queryText}
          onChange={(e) => {
            setQueryText(e.target.value);
            if (!isOpen && e.target.value.length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search units, departments, programmes, courses (e.g. AY 100, CoHU, Philosophy)..."
          className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 backdrop-blur-md focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isSearching && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />}
          {queryText && (
            <button
              onClick={handleClear}
              className="text-slate-400 hover:text-white transition rounded p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Results Box */}
      {isOpen && queryText.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-40 max-h-80 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl">
          {isSearching ? (
            <div className="flex items-center justify-center p-6 text-xs text-slate-400 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Searching catalogue in Firestore...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching academic units, departments, programmes, or courses found.
            </div>
          ) : (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Matching Results ({results.length})
              </p>
              {results.map((res) => (
                <button
                  key={`${res.type}_${res.id}`}
                  onClick={() => {
                    onSelectResult(res);
                    setIsOpen(false);
                  }}
                  className="group flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-900 border border-transparent hover:border-slate-800"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="mt-0.5 rounded-lg bg-slate-900 border border-slate-800 p-1.5 shrink-0 group-hover:border-slate-700">
                      {getIcon(res.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white truncate">{res.title}</p>
                        {res.badge && (
                          <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-300 border border-slate-700">
                            {res.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">{res.subtitle}</p>
                    </div>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0 ml-2 mt-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
