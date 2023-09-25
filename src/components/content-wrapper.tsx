import type { ReactNode } from 'react';
import cn from 'classnames';

export default function ContentWrapper({
  children,
  className,
  outerBackground,
  innerBackground
}: {
  children: ReactNode;
  className?: string;
  outerBackground?: string;
  innerBackground?: string;
}) {
  return (
    <div className={cn('flex justify-center', outerBackground)}>
      <div
        className={cn(
          'flex min-h-[calc(100vh-var(--navbar-height)-var(--footer-height))] w-full max-w-[700px] flex-col px-8 py-5',
          className,
          innerBackground ?? 'bg-gray-100'
        )}
      >
        {children}
      </div>
    </div>
  );
}
