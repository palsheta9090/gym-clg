import React from 'react';
import { Menu, Calendar, ShieldCheck, User, Flame } from 'lucide-react';
import { formatDate, getTodayISO } from '../../utils/formatters';
import { storageService } from '../../services/storageService';

interface HeaderProps {
  onMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle }) => {
  const admin = storageService.getAdmin();
  const todayFormatted = formatDate(getTodayISO());

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base lg:text-lg font-bold text-slate-800 tracking-tight">
            {admin.gymName}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            Owner & Admin Desk
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Firebase Live Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[11px] font-semibold">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Firebase DB Active</span>
        </div>

        {/* Today's Date */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>{todayFormatted}</span>
        </div>

        {/* Admin Badge Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            <User className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-left hidden md:block">
            <div className="text-xs font-bold text-slate-800 leading-tight">
              {admin.name}
            </div>
            <div className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Admin Owner</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
