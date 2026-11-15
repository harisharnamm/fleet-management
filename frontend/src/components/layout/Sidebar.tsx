import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Bell,
  FileCode2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

export function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/vehicles', label: 'Vehicle Inventory', icon: Truck },
    { to: '/tracking', label: 'Live Tracking', icon: MapPin },
    { to: '/notifications', label: 'SMS Notifications', icon: Bell },
    { to: '/docs', label: 'API Documentation', icon: FileCode2 }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
          <Truck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white">FleetFlow</h1>
          <p className="text-xs text-slate-400">Enterprise Fleet Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Information & Role Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || 'Fleet Operator'}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <ShieldCheck className="h-3 w-3 text-blue-400" />
              <span className="uppercase tracking-wider font-mono text-[10px] text-blue-300">
                {user?.role || 'VIEWER'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
