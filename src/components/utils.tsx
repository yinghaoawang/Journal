import cn from 'classnames';

export const UserIsPrivateText = ({ className }: { className?: string }) => {
  return (
    <div className={cn('italic', className)}>
      <p>This user has a private profile.</p>
      <p>To view their posts, they must follow you.</p>
    </div>
  );
};
