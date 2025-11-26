import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';

import SidebarLink from '../components/SidebarLink';
import UserBadge from '../components/UserBadge';
import AuthPanel from '../components/AuthPanel';
import CustomizationPanel from '../components/CustomizationPanel';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/mascot-showcase', label: 'Mascot Showcase', icon: '🤖' },
  { to: '/reading', label: 'Reading', icon: '📖' },
  { to: '/listening', label: 'Listening', icon: '🎧' },
  { to: '/speaking', label: 'Speaking', icon: '🗣️' },
  { to: '/writing', label: 'Writing', icon: '✍️' },
  { to: '/vocabulary', label: 'Vocabulary', icon: '🧠' },
  { to: '/workspace', label: 'Workspace', icon: '🗂️' },
  { to: '/mock-test', label: 'Mock Test', icon: '🧪' }
];

function AppLayout() {
  const { user } = useAuthStore();
  const {
    backgroundColor,
    primaryColor,
    fontSize,
    animations,
    sidebarCollapsed,
    layout
  } = useThemeStore();

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  const getLayoutPadding = () => {
    switch (layout) {
      case 'compact': return 'p-4';
      case 'spacious': return 'p-12';
      default: return 'p-8';
    }
  };

  return (
    <div
      className={`min-h-screen text-slate-100 flex ${getFontSizeClass()}`}
      style={{ backgroundColor }}
    >
      <aside
        className={`border-r border-slate-800 flex flex-col gap-6 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16 p-3' : 'w-64 p-6'
        }`}
        style={{ backgroundColor: `${backgroundColor}E6` }}
      >
        <div className={sidebarCollapsed ? 'text-center' : ''}>
          <p className="text-xs uppercase text-slate-500">
            {sidebarCollapsed ? 'Lumos' : 'Lumos IELTS'}
          </p>
          {!sidebarCollapsed && (
            <h1
              className="text-2xl font-semibold"
              style={{ color: primaryColor }}
            >
              AI Tutor
            </h1>
          )}
        </div>
        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <SidebarLink key={link.to} {...link} collapsed={sidebarCollapsed} />
          ))}
        </nav>
        {user ? <UserBadge user={user} collapsed={sidebarCollapsed} /> : <AuthPanel />}
      </aside>
      <main className="flex-1 overflow-y-auto" style={{ backgroundColor }}>
        <motion.div
          className={`max-w-6xl mx-auto ${getLayoutPadding()}`}
          initial={animations ? { opacity: 0, y: 16 } : {}}
          animate={animations ? { opacity: 1, y: 0 } : {}}
          transition={animations ? { duration: 0.3 } : {}}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Customization Panel */}
      <CustomizationPanel />
    </div>
  );
}

export default AppLayout;

