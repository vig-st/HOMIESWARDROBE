import { useContext, useState } from 'react';
import { AuthContext } from '../../utils/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';

export function Addresses() {
  const { user, updateAddresses } = useContext(AuthContext);
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ label: '', line1: '', line2: '', city: '', state: '', zip: '', country: '', isDefault: false });

  const saveAddress = () => {
    const next = [...addresses, { ...form, id: `address-${Date.now()}` }];
    setAddresses(next);
    updateAddresses(next);
    setModalOpen(false);
    setForm({ label: '', line1: '', line2: '', city: '', state: '', zip: '', country: '', isDefault: false });
  };

  const removeAddress = (id) => {
    const next = addresses.filter((address) => address.id !== id);
    setAddresses(next);
    updateAddresses(next);
  };

  const setDefault = (id) => {
    const next = addresses.map((address) => ({ ...address, isDefault: address.id === id }));
    setAddresses(next);
    updateAddresses(next);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold">Address Book</h1>
          <p className="text-sm text-secondary">Manage your shipping addresses and set a default delivery location.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Add Address</Button>
      </div>

      <div className="grid gap-6">
        {addresses.map((address) => (
          <Card key={address.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">{address.label}</p>
                <p className="text-sm text-secondary">{address.line1}, {address.line2}</p>
                <p className="text-sm text-secondary">{address.city}, {address.state} {address.zip}</p>
                <p className="text-sm text-secondary">{address.country}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant={address.isDefault ? 'outline' : 'ghost'} onClick={() => setDefault(address.id)}>{address.isDefault ? 'Default' : 'Set default'}</Button>
                <Button variant="outline" onClick={() => removeAddress(address.id)}>Delete</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} title="Add address" onClose={() => setModalOpen(false)} actions={<Button onClick={saveAddress}>Save address</Button>}>
        <div className="grid gap-4">
          <input className="rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Label (Home, Work)" value={form.label} onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))} />
          <input className="rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Address line 1" value={form.line1} onChange={(e) => setForm((prev) => ({ ...prev, line1: e.target.value }))} />
          <input className="rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Address line 2" value={form.line2} onChange={(e) => setForm((prev) => ({ ...prev, line2: e.target.value }))} />
          <div className="grid gap-4 md:grid-cols-3">
            <input className="rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} />
            <input className="rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="State" value={form.state} onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))} />
            <input className="rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="ZIP Code" value={form.zip} onChange={(e) => setForm((prev) => ({ ...prev, zip: e.target.value }))} />
          </div>
          <input className="rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Country" value={form.country} onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
