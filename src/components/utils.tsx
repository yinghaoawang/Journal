import cn from 'classnames';
import { CiLock } from 'react-icons/ci';

export const UserIsPrivateText = ({
  className,
  position = 'center'
}: {
  className?: string;
  position?: 'center' | 'start' | 'end';
}) => {
  let positionClasses;
  if (position === 'start') positionClasses = 'justify-start';
  else if (position === 'end') positionClasses = 'justify-end';
  else positionClasses = 'justify-center items-center';
  return (
    <div className={cn('italic', positionClasses, className)}>
      <div
        className={cn(
          'mb-6 mt-3 flex h-[70px] w-[70px] items-center justify-center rounded-full border border-gray-800',
          positionClasses
        )}
      >
        <CiLock size={34} />
      </div>
      <p>This user has a private profile.</p>
      <p>To view their posts, they must follow you.</p>
    </div>
  );
};
