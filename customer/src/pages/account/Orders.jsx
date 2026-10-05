import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import apiRequest from '../../services/api';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { apiRequest('/api/orders/my-orders').then((response) => setOrders(response.data || [])).catch((requestError) => setError(requestError.message)); }, []);
  return (
    <div className="space-y-8">
      <Card title="Order history">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="space-y-4">
            {orders.map((order) => (
            <div key={order._id} className="grid gap-4 rounded-3xl border border-gray-200 p-6 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-sm font-semibold text-primary">{order._id}</p>
                <p className="mt-2 text-sm text-secondary">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="mt-2 text-sm text-secondary">Total: ₹{order.totalAmount}</p>
                <p className="mt-2 text-sm text-secondary">
                  {order.paymentMethod} · Payment: {order.paymentStatus}
                  {order.paymentMethod?.includes('(Demo)') && ' — Simulated only; no payment collected or verified.'}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs uppercase ${order.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : order.orderStatus === 'Shipped' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                  {order.orderStatus}
                </span>
                <Button variant="outline" className="whitespace-nowrap">Order details</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
