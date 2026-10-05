import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { Button } from '../components/ui/Button';

export function Stores() {
  const [location, setLocation] = useState('');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Store Locator' }]} />
      <section className="mb-14 max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Visit HOMIESWARDROBE</p>
        <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight md:text-6xl">Find HOMIESWARDROBE</h1>
        <p className="mt-5 max-w-xl text-secondary">Our online store is open every day. Physical HOMIESWARDROBE stores are coming soon.</p>
      </section>
      <section className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-3xl border border-gray-200 bg-section p-6 md:p-10">
          <label htmlFor="store-location" className="mb-3 block text-xs font-semibold uppercase tracking-[0.25em] text-secondary">Search location</label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input id="store-location" value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Enter city or PIN code" className="min-h-12 flex-1 rounded-full border border-gray-200 bg-white px-5 text-sm outline-none focus:border-primary" />
            <Button type="button" variant="outline" onClick={() => setLocation('Location search coming soon')}>Use My Location</Button>
          </div>
          <div className="mt-10 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-heading font-semibold">No locations to show yet</h2>
            <p className="mt-3 text-sm text-secondary">Physical HOMIESWARDROBE stores are coming soon. Shop the complete collection online anytime.</p>
            <Button asChild className="mt-6"><Link to="/shop">Shop Online</Link></Button>
          </div>
        </div>
        <div className="flex min-h-64 items-end rounded-3xl bg-primary p-8 text-white md:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Online, wherever you are</p>
            <p className="mt-4 text-2xl font-heading font-semibold">Your wardrobe, without the commute.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
