import { ClerkProvider } from '@clerk/nextjs';
import { SidebarProvider } from './sidebar-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </ClerkProvider>
  );
}
