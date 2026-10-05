import { Breadcrumb } from '../components/Breadcrumb';

const departments = ['Design', 'Technology', 'Marketing', 'Operations', 'Customer Experience'];

export function Careers() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Careers' }]} />
      <section className="border-b border-gray-200 pb-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Careers at HOMIESWARDROBE</p>
        <h1 className="max-w-4xl text-4xl font-heading font-semibold uppercase tracking-tight md:text-7xl">Create. Build. Move Fashion Forward.</h1>
        <p className="mt-6 max-w-2xl text-lg text-secondary">We are building a thoughtful fashion experience around personal style, useful technology, and everyday confidence.</p>
      </section>
      <section className="grid gap-12 py-16 md:grid-cols-[0.8fr_1.2fr]">
        <div><h2 className="text-3xl font-heading font-semibold">Find your place</h2><p className="mt-4 text-sm leading-7 text-secondary">As HOMIESWARDROBE grows, we will share opportunities for people who care about design, craft, and making shopping feel more human.</p></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {departments.map((department) => <div key={department} className="border-b border-gray-200 py-4 text-sm font-semibold uppercase tracking-[0.15em]">{department}</div>)}
        </div>
      </section>
      <section className="rounded-3xl bg-section p-8 md:p-12"><h2 className="text-2xl font-heading font-semibold">No open positions right now.</h2><p className="mt-3 text-sm text-secondary">We're always interested in creative people. Check back soon.</p></section>
    </div>
  );
}
