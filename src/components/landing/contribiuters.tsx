"use client";
import React, { useEffect, useState, useRef } from "react";

type RepoRef = { owner: string; repo: string };

type RawContributor = {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    contributions: number;
    name?: string;
};

type Contributor = {
    login: string;
    id: number;
    avatar_url: string;
    html_url: string;
    contributions: number;
    displayName?: string;
};

type Props = {
    repos?: RepoRef[];
    title?: string;
    maxContributors?: number;
};

export default function TopContributors({
    repos = [{ owner: 'bhar1gitr', repo: 'Devfolio' }],
    title = "Top Contributors",
    maxContributors = 50,
}: Props) {
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (!repos || repos.length === 0) {
            setContributors([]);
            setLoading(false);
            return;
        }

        // Prevent re-fetching if already fetched
        if (fetchedRef.current) return;

        let aborted = false;
        const controller = new AbortController();

        async function fetchAll() {
            setLoading(true);
            setError(null);

            try {
                const headers: Record<string, string> = {
                    Accept: "application/vnd.github.v3+json",
                };

                const allResults: RawContributor[][] = [];

                for (const r of repos) {
                    const url = `https://api.github.com/repos/${r.owner}/${r.repo}/contributors?per_page=100`;
                    const res = await fetch(url, { headers, signal: controller.signal });

                    if (!res.ok) {
                        const txt = await res.text();
                        throw new Error(`Failed to fetch ${r.owner}/${r.repo}: ${res.status} ${txt}`);
                    }

                    const json = (await res.json()) as RawContributor[];
                    allResults.push(json || []);
                }

                if (aborted) return;

                const map = new Map<string, Contributor>();
                for (const list of allResults) {
                    for (const c of list) {
                        const existing = map.get(c.login);
                        if (existing) {
                            existing.contributions += c.contributions;
                        } else {
                            map.set(c.login, {
                                login: c.login,
                                id: c.id,
                                avatar_url: c.avatar_url,
                                html_url: c.html_url,
                                contributions: c.contributions,
                                displayName: c.login,
                            });
                        }
                    }
                }

                const aggregated = Array.from(map.values()).sort((a, b) => b.contributions - a.contributions);
                setContributors(aggregated.slice(0, maxContributors));
                fetchedRef.current = true;
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error(err);
                setError(err.message || "Unknown error fetching contributors");
            } finally {
                if (!aborted) setLoading(false);
            }
        }

        fetchAll();

        return () => {
            aborted = true;
            controller.abort();
        };
    }, []); // Empty dependency array - only fetch once

    const maxContrib = contributors.length ? Math.max(...contributors.map((c) => c.contributions)) : 0;

    return (
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold leading-tight">{title}</h2>
                    <p className="text-sm text-gray-500">
                    </p>
                </div>
            </div>

            <div className="rounded-2xl p-4 shadow-lg bg-white dark:bg-card/60 transition-colors duration-300">
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Array.from({ length: Math.min(6, maxContributors) }).map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse flex items-center gap-4 bg-white/70 dark:bg-card/80 p-4 rounded-xl shadow-sm"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <div className="flex-1">
                                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2" />
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className="p-6 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400 rounded">
                        Error: {error}
                    </div>
                ) : contributors.length === 0 ? (
                    <div className="p-6 text-gray-500 dark:text-gray-400">
                        No contributors found for the provided repositories.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {contributors.map((c, idx) => (
                            <a
                                key={c.login}
                                href={c.html_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block bg-white/80 dark:bg-card/70 hover:scale-[1.02] transition-transform duration-200 
                     rounded-2xl p-4 shadow-sm border border-border/50 dark:border-border/40"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <img
                                            src={c.avatar_url}
                                            alt={c.login}
                                            className="w-14 h-14 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-sm"
                                        />
                                        <div className="absolute -right-2 -top-2 bg-gradient-to-br from-yellow-400 to-red-400 text-white text-xs font-bold px-2 py-0.5 rounded-2xl shadow">
                                            #{idx + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <div className="truncate">
                                                <div className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                                                    {c.displayName || c.login}
                                                </div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">@{c.login}</div>
                                            </div>
                                            <div className="ml-3 text-right">
                                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{c.contributions}</div>
                                                <div className="text-xs text-gray-400 dark:text-gray-500">contributions</div>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex items-center gap-3">
                                            <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                                <div
                                                    style={{ width: `${(c.contributions / (maxContrib || 1)) * 100}%` }}
                                                    className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                />
                                            </div>
                                            <div className="w-8 text-xs text-gray-500 dark:text-gray-400 text-right">
                                                {Math.round((c.contributions / (maxContrib || 1)) * 100)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-4 w-4 opacity-80"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path d="M10 2a2 2 0 00-2 2v2H6a2 2 0 00-2 2v6h12V8a2 2 0 00-2-2h-2V4a2 2 0 00-2-2z" />
                                        </svg>
                                        <span>Repo contributors</span>
                                    </div>
                                    <div className="opacity-80 group-hover:text-purple-500 dark:group-hover:text-pink-400 transition-colors">
                                        View profile
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}