'use client';

import { useCallback, useEffect, useState } from 'react';

export interface Route {
  path: string; // e.g. "/provider/dashboard", "/employee/whats-new/a-1001"
}

function currentPath(): string {
  if (typeof window === 'undefined') return '/';
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function useHashRoute() {
  const [path, setPath] = useState<string>(currentPath());

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (typeof window !== 'undefined') {
      window.location.hash = to;
    }
    setPath(to);
  }, []);

  return { path, navigate };
}

export function parsePath(path: string): { segments: string[] } {
  const clean = path.replace(/^\//, '').replace(/\/$/, '');
  const segments = clean ? clean.split('/') : [];
  return { segments };
}