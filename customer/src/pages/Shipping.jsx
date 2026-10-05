import { Breadcrumb } from '../components/Breadcrumb';
const sections = [
  ['Shipping', 'Shipping fees and free-shipping thresholds are shown during checkout using current store settings. Timelines shown in this project are for demonstration purposes.'],
  ['Order Processing', 'After an order is placed, its items and address are confirmed before processing.'],
  ['Delivery & Tracking', 'Delivery updates are represented by the order status in your account. This demo does not connect to a live courier tracking service.'],
  ['Cancellations', 'Contact support as soon as possible if an order needs attention. Availability depends on its processing stage.'],
  ['Returns', 'Return handling is represented as a demo workflow. Contact support with your order details and reason.'],
  ['Refunds & Replacements', 'Refund or replacement outcomes are handled through the demo support process and are not connected to a payment gateway.'],
  ['Damaged or Incorrect Items', 'Keep the order details and contact support promptly with a description of the issue.'],
];

export function Shipping() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Shipping & Returns' }]} />
      <section className="mb-14 max-w-4xl"><p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Support information</p><h1 className="text-4xl font-heading font-semibold uppercase tracking-tight md:text-6xl">Shipping & Returns</h1><p className="mt-5 max-w-2xl text-lg text-secondary">A clear guide to the demo checkout and support experience. This page does not replace commercial policy.</p></section>
      <div className="grid gap-x-12 md:grid-cols-2">{sections.map(([title, body]) => <article key={title} className="border-t border-gray-200 py-8"><h2 className="text-2xl font-heading font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-secondary">{body}</p></article>)}</div>
    </div>
  );
}
