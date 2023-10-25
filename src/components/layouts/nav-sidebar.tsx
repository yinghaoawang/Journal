// Currently, unused
import Link from 'next/link';
import cn from 'classnames';
import {
  LuLogOut,
  LuSettings,
  LuCompass,
  LuUserCircle2,
  LuNewspaper
} from 'react-icons/lu';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { LoadingSpinner } from '../loading';
import { type IconType } from 'react-icons/lib';

type NavLink = {
  href?: string;
  title: string;
  icon?: IconType;
};

const navLinks: NavLink[] = [
  {
    href: '/feed',
    title: 'Feed',
    icon: LuNewspaper
  },
  {
    href: '/explore',
    title: 'Explore',
    icon: LuCompass
  },
  {
    href: '/settings',
    title: 'Settings',
    icon: LuSettings
  }
];

const NavLinkCard = ({ navLink }: { navLink: NavLink }) => {
  return (
    <Link href={navLink.href ?? ''}>
      <div className="flex items-center gap-2">
        {navLink.icon && <navLink.icon size={22} />}
        <span className="hidden sm:inline-block">{navLink.title}</span>
      </div>
    </Link>
  );
};

export default function NavSidebar({ className }: { className?: string }) {
  const { user: authUser } = useUser();
  if (authUser == null) return <LoadingSpinner />;
  const displayName =
    (authUser?.publicMetadata?.displayName as string) ?? authUser?.firstName;
  return (
    <div className={cn('shrink-0 px-4 py-4', className)}>
      <NavLinkCard
        navLink={{
          href: `/user/${authUser.id}`,
          title: `Hi ${displayName}!`,
          icon: LuUserCircle2
        }}
      />
      {navLinks.map((navLink) => (
        <NavLinkCard key={navLink.title} navLink={navLink} />
      ))}

      <SignOutButton>
        <NavLinkCard
          navLink={{
            title: `Sign Out`,
            icon: LuLogOut
          }}
        />
      </SignOutButton>
    </div>
  );
}
