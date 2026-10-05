import { Breadcrumb } from '../components/Breadcrumb';

const sections = [
  ['Our Approach', 'We aim to make better choices as HOMIESWARDROBE grows, learning from each collection and each customer.'],
  ['Thoughtful Materials', 'We are building a clearer understanding of the materials in our products so future choices can be more considered.'],
  ['Better Packaging', 'We are working toward packaging that is practical, measured, and easier to reuse or recycle where local systems allow.'],
  ['Longer Product Life', 'Good care helps clothes stay in rotation. We design this store around pieces you can wear often and style your way.'],
  ['Responsible Growth', 'Progress is ongoing. We will keep improving our process as we learn more and as the project develops.'],
];

export function Sustainability() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Sustainability' }]} />
      <section className="max-w-4xl border-b border-gray-200 pb-16"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">A work in progress</p><h1 className="text-4xl font-heading font-semibold uppercase tracking-tight md:text-6xl">Better choices, worn often.</h1><p className="mt-6 max-w-2xl text-lg text-secondary">We aim to make better choices as HOMIESWARDROBE grows. This is an honest starting point, not a list of finished claims.</p></section>
      <section className="grid gap-x-12 md:grid-cols-2">{sections.map(([title, body], index) => <article key={title} className="border-b border-gray-200 py-10"><p className="text-xs font-semibold tracking-[0.25em] text-secondary">0{index + 1}</p><h2 className="mt-3 text-2xl font-heading font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-secondary">{body}</p></article>)}</section>
      <p className="mt-12 text-center text-sm font-semibold uppercase tracking-[0.25em]">Buy thoughtfully. Wear often. Care well.</p>
    </div>
  );
}
