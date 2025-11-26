import type { User } from '../api/types';

interface Props {
  user?: User | null;
  collapsed?: boolean;
}

const UserBadge = ({ user, collapsed }: Props) => {
  if (!user) {
    return (
      <div className={`mt-auto rounded-xl border border-slate-800 text-sm text-slate-400 ${
        collapsed ? 'p-2 text-center' : 'p-4'
      }`}>
        {collapsed ? (
          <span className="text-xs">👤</span>
        ) : (
          <>
            <p>Guest mode</p>
            <p>Sign in to sync progress.</p>
          </>
        )}
      </div>
    );
  }
  return (
    <div className={`mt-auto rounded-xl border border-slate-800 bg-slate-900/50 ${
      collapsed ? 'p-2 text-center' : 'p-4'
    }`}>
      {collapsed ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-lg">👤</span>
          <span className="text-xs text-slate-500">L{user.level}</span>
        </div>
      ) : (
        <>
          <p className="text-xs uppercase text-slate-500">Logged in</p>
          <p className="text-lg font-semibold">{user.full_name}</p>
          <div className="flex gap-4 text-sm mt-2">
            <span>XP {user.xp}</span>
            <span>Coins {user.coins}</span>
            <span>🔥 {user.streak}</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Level {user.level}</p>
        </>
      )}
    </div>
  );
};

export default UserBadge;

