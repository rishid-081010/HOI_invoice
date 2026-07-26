import React from 'react';

export type MainTab = 'home' | 'all' | 'stage1' | 'stage2' | 'escalated' | 'workflow' | 'settings';

interface SidebarProps {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenSettings }) => {
  const navItems = [
    { id: 'home', label: 'Dashboard Overview' },
    { id: 'all', label: 'All Clients' },
    { id: 'stage1', label: '1st Reminder' },
    { id: 'stage2', label: '2nd Reminder' },
    { id: 'escalated', label: 'Escalated' },
    { id: 'workflow', label: 'n8n Workflow Canvas' },
    { id: 'settings', label: 'Settings' },
  ] as const;

  return (
    <aside className="w-[240px] h-screen bg-[#111827] border-r border-slate-800 flex flex-col shrink-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-slate-100 tracking-wide">
          Invoice Recovery
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="px-3">
              <button
                onClick={() => {
                  if (item.id === 'settings') {
                    onOpenSettings();
                  } else {
                    setActiveTab(item.id as MainTab);
                  }
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded transition-all text-sm font-medium ${
                  isActive 
                    ? 'bg-[#1e40af] text-white' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
