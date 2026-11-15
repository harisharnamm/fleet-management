import { LogOut, Activity, Wifi } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Header({ title = 'Fleet Operations' }: { title?: string }) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Gateway connection indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800">
          <Wifi className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span>Gateway Active (Port 4000)</span>
        </div>

        {/* User Info & Logout */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden md:block">
            <p className="text-xs font-medium text-slate-800">{user?.email}</p>
            <p className="text-[10px] text-slate-500 uppercase">{user?.role}</p>
          </div>
          <Button variant="outline" size="sm" onClick={logout} className="gap-1.5 text-xs text-slate-600 hover:text-rose-600">
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
