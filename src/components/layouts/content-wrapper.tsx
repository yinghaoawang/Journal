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
          'content-height flex w-full max-w-[1000px] flex-col px-10 py-5',
          className,
          innerBackground ?? 'bg-white'
        )}
      >
        {children}
      </div>
    </div>
  );
}
