import { useContext, useState } from 'react';
import { AuthContext } from '../../utils/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '',
    gender: user?.gender || '',
  });
  const [status, setStatus] = useState('');

  const handleSave = (event) => {
    event.preventDefault();
    updateProfile(form);
    setStatus('Profile updated successfully');
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card title="Profile summary">
          <div className="space-y-4 text-sm text-secondary">
            <div>
              <p className="font-semibold text-primary">Full name</p>
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
        <Card title="Edit profile">
          {status && <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">{status}</div>}
          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="First Name" value={form.firstName} onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))} />
              <Input label="Last Name" value={form.lastName} onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
              <Input label="Phone Number" type="tel" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Date of Birth" type="date" value={form.dob} onChange={(e) => setForm((prev) => ({ ...prev, dob: e.target.value }))} />
              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
                  className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">Select gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>
            </div>
            <Button type="submit" className="w-full py-4">Save Changes</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
