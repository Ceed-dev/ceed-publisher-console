'use client';

import { useAuth } from '@/hooks/use-auth';

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b bg-card px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {children}
        {user && (
          <div className="flex items-center gap-2">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="h-8 w-8 rounded-full"
              />
            )}
            <span className="text-sm text-muted-foreground">
              {user.displayName || user.email}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
