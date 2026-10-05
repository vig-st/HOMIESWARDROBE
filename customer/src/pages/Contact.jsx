import { useState } from 'react';
import { Breadcrumb } from '../components/Breadcrumb';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.subject || !form.email.includes('@') || form.message.trim().length < 20) {
      setError('Please complete every field with a valid email and a message of at least 20 characters.');
      return;
    }
    const submissions = JSON.parse(window.localStorage.getItem('homiesContact') || '[]');
    submissions.push({ ...form, date: new Date().toISOString() });
    window.localStorage.setItem('homiesContact', JSON.stringify(submissions));
    setError('');
    setSent(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <h1 className="text-3xl font-heading font-semibold mb-3">Contact Us</h1>
        <p className="mb-8 text-sm text-secondary">Demo form: messages are saved only in this browser. They are not sent to HOMIESWARDROBE and will not receive a reply.</p>
        {sent ? (
          <div className="rounded-3xl border border-green-200 bg-green-50 p-6">
            <p className="text-sm text-green-900">Demo message saved in this browser only. No message was sent to HOMIESWARDROBE.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required className="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required type="email" className="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required className="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea required minLength={20} className="w-full rounded-3xl border border-gray-200 px-4 py-3 text-sm" placeholder="Message" rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit">Save Demo Message</Button>
          </form>
        )}
      </Card>
      <div className="rounded-3xl bg-section p-8"><h2 className="text-2xl font-heading font-semibold">How can we help?</h2><ul className="mt-6 space-y-4 text-sm text-secondary">{['Orders', 'Returns', 'Sizing', 'Products', 'Account Support'].map((topic) => <li key={topic} className="border-b border-gray-200 pb-4">{topic}</li>)}</ul></div>
      </div>
    </div>
  );
}
