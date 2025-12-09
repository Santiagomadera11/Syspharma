import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const DashboardLayout = ({ 
  children, 
  title, 
  activeSection, 
  onSectionChange 
}: DashboardLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar title={title} />
        
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Sidebar a la DERECHA */}
      <Sidebar activeSection={activeSection} onSectionChange={onSectionChange} />
    </div>
  );
};
