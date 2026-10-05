import { NavLink, Outlet } from 'react-router-dom';
import { Home, ShoppingBag, Settings, UserCircle } from 'lucide-react';
import { cn } from '../utils/cn';

const tabs = [
  { label: 'Dashboard', path: '/account', icon: UserCircle },
  { label: 'Profile', path: '/account/profile', icon: Home },
  { label: 'Orders', path: '/account/orders', icon: ShoppingBag },
  { label: 'Addresses', path: '/account/addresses', icon: Home },
  { label: 'Settings', path: '/account/settings', icon: Settings },
];

export function AccountLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-10">
            <h2 className="text-lg font-semibold uppercase tracking-[0.3em] text-secondary">Account</h2>
            <p className="mt-3 text-sm text-secondary">Manage your profile, orders, and settings in one place.</p>
          </div>
          <nav className="space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.path}
                  to={tab.path}
                  end={tab.path === '/account'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-3xl px-4 py-3 transition-all',
                      isActive ? 'bg-primary/10 text-primary' : 'text-secondary hover:bg-gray-50'
                    )
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
