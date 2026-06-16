import React from 'react';
import { Calendar, HelpCircle, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-blue-900 text-white h-16 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg">
          <Calendar size={24} />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">面试安排自动化工具</h1>
          <p className="text-xs text-blue-200">Interview Scheduler</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="帮助"
        >
          <HelpCircle size={20} />
        </button>
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-white/20">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <User size={16} />
          </div>
          <span className="text-sm font-medium hidden sm:inline">HR管理员</span>
        </div>
      </div>
    </header>
  );
};
