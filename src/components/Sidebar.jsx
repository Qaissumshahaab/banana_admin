import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BananaMark from './BananaMark';

const links = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/accounts', label: 'Accounts', icon: '👥' },
  { to: '/slider', label: 'Slider Images', icon: '🖼️' },
];

export default function Sidebar({ onNavigate }) {
  const { admin, logout } = useAuth();

  return (
    <div className="flex flex-col h-full bg-ink-900 border-r border-banana-900/40 w-64 shrink-0">
      <div className="px-5 py-6 flex items-center gap-2">
        <BananaMark size={24} />
        <div>
          <p className="font-display font-bold text-banana-100 leading-tight">
            KELA<span className="text-banana-500">.com</span>
          </p>
          <p className="text-[11px] text-banana-200/50 leading-tight">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition focus-ring ${
                isActive
                  ? 'bg-banana-500 text-ink-900'
                  : 'text-banana-100/80 hover:bg-white/5 hover:text-banana-50'
              }`
            }
          >
            <span>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/5">
        <div className="px-2 py-2 mb-1">
          <p className="text-[11px] text-banana-200/40">Signed in as</p>
          <p className="text-xs font-semibold text-banana-100 truncate">{admin?.email}</p>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-banana-100/80 hover:bg-white/5 hover:text-red-300 transition focus-ring"
        >
          🚪 Log out
        </button>
      </div>
    </div>
  );
}
