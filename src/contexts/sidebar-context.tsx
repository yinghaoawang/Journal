import {
  createContext,
  useState,
  type SetStateAction,
  type Dispatch
} from 'react';

type SidebarContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
};

export const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  setIsOpen: () => null
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}
