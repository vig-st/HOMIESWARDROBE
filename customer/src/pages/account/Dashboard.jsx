import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../utils/AuthContext';
import { WishlistContext } from '../../utils/WishlistContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

const orders = [
  { id: 'HWD-3021', date: '2026-07-24', status: 'Delivered', total: 145.0 },
  { id: 'HWD-3110', date: '2026-07-18', status: 'Shipping', total: 98.0 },
  { id: 'HWD-2968', date: '2026-06-30', status: 'Processing', total: 229.0 },
];

export function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const { items: wishlistItems } = useContext(WishlistContext);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Card>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-secondary">Welcome back</p>
              <h1 className="mt-3 text-4xl font-heading font-semibold">{user?.firstName} {user?.lastName}</h1>
              <p className="mt-2 text-sm text-secondary">Manage your account, track orders, and update details.</p>
            </div>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </Card>

        <Card title="Account snapshot">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-secondary border-b border-gray-200 pb-3">
              <span>Wishlist</span>
              <strong>{wishlistItems.length}</strong>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary border-b border-gray-200 pb-3">
              <span>Recent orders</span>
              <strong>{orders.length}</strong>
            </div>
            <div className="flex items-center justify-between text-sm text-secondary">
              <span>Saved addresses</span>
              <strong>{user?.addresses?.length || 0}</strong>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Profile summary">
          <div className="space-y-4 text-sm text-secondary">
            <div>
              <p className="font-semibold text-primary">Name</p>
              <p>{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="font-semibold text-primary">Email</p>
              <p>{user?.email}</p>
            </div>
            <div>
              <p className="font-semibold text-primary">Phone</p>
              <p>{user?.phone}</p>
            </div>
          </div>
        </Card>

        <Card title="Recent orders">
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-3xl border border-gray-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{order.id}</p>
                    <p className="text-xs text-secondary">{order.date}</p>
                  </div>
                  <span className="text-sm text-secondary">${order.total.toFixed(2)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase text-primary">{order.status}</span>
                  <Link to="/account/orders" className="text-sm text-primary hover:text-brand">View details</Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Saved addresses">
        <div className="space-y-4 text-sm text-secondary">
          {user?.addresses?.map((address) => (
            <div key={address.id} className="rounded-3xl border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary">{address.label}</p>
                  <p>{address.line1}, {address.line2}</p>
                  <p>{address.city}, {address.state} {address.zip}</p>
                  <p>{address.country}</p>
                </div>
                {address.isDefault && <span className="rounded-full bg-primary/10 px-3 py-1 text-xs uppercase text-primary">Default</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
