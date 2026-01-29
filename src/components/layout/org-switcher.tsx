'use client';

import { useOrganization } from '@/hooks/use-organization';
import { ChevronDown, Plus, Building2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

export function OrgSwitcher() {
  const { organizations, currentOrg, setCurrentOrg, loading } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('orgSwitcher');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <Link
        href="/organizations/new"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        <Plus className="h-4 w-4" />
        {t('createOrg')}
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          <span className="truncate max-w-[150px]">{currentOrg.name}</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-56 rounded-md border bg-background shadow-lg">
          <div className="p-1">
            {organizations.map((org) => (
              <button
                key={org.orgId}
                onClick={() => {
                  setCurrentOrg(org);
                  setIsOpen(false);
                }}
                className={`
                  flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm
                  ${org.orgId === currentOrg.orgId ? 'bg-accent' : 'hover:bg-accent'}
                `}
              >
                <Building2 className="h-4 w-4" />
                <span className="truncate">{org.name}</span>
              </button>
            ))}
          </div>
          <div className="border-t p-1">
            <Link
              href="/organizations/new"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              {t('createOrg')}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
