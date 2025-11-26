import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

interface Props {
  to: string;
  label: string;
  icon?: string;
  collapsed?: boolean;
}

const SidebarLink = ({ to, label, icon, collapsed }: Props) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      clsx(
        'flex items-center rounded-xl py-2 text-sm font-medium transition-all duration-200',
        collapsed ? 'justify-center px-2' : 'gap-2 px-4',
        isActive ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-white'
      )
    }
    title={collapsed ? label : undefined}
  >
    <span className={collapsed ? 'text-lg' : ''}>{icon}</span>
    {!collapsed && label}
  </NavLink>
);

export default SidebarLink;

