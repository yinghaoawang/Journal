import type { ReactNode } from 'react';
import cn from 'classnames';

export default function ContentWrapper({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'content-height flex w-full max-w-[1000px] flex-col px-10 py-5',
        className
      )}
    >
      {children}
    </div>
  );
}
