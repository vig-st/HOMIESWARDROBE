import { Breadcrumb } from '../components/Breadcrumb';

export function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
      <section className="border-b border-gray-200 pb-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">About HOMIESWARDROBE</p>
        <h1 className="text-5xl font-heading font-semibold uppercase tracking-tight md:text-8xl">Wear Your Identity</h1>
        <p className="mt-6 max-w-2xl text-lg text-secondary">HOMIESWARDROBE is a modern fashion label focused on everyday streetwear, minimal essentials, and expressive personal style.</p>
      </section>
      <section className="grid gap-12 py-16 md:grid-cols-2">
        <div><h2 className="text-3xl font-heading font-semibold">Our Story</h2><p className="mt-4 text-sm leading-7 text-secondary">We created HOMIESWARDROBE as a space for clothes that fit real routines: easy layers, considered essentials, and pieces that leave room for your point of view.</p></div>
        <div><h2 className="text-3xl font-heading font-semibold">Our Philosophy</h2><p className="mt-4 text-sm leading-7 text-secondary">Style is personal. Our role is to offer a clear, useful edit that makes getting dressed feel more expressive and less complicated.</p></div>
      </section>
      <section className="border-y border-gray-200 py-16"><h2 className="text-3xl font-heading font-semibold">Designed for everyday identity</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-secondary">From relaxed silhouettes to dependable layers, each product is presented with its fit, color, and styling context so you can make a choice that feels like yours.</p></section>
      <section className="grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-5">{['Individuality', 'Quality', 'Comfort', 'Modern Design', 'Accessibility'].map((value) => <div key={value} className="border-t border-gray-200 pt-4 text-sm font-semibold uppercase tracking-[0.12em]">{value}</div>)}</section>
    </div>
  );
}
