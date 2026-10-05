import { Breadcrumb } from '../components/Breadcrumb';

const steps = [
  {
    step: '01',
    title: 'Initiate Your Return',
    body: 'Contact us within 14 days of receiving your order via the Contact page or by emailing returns@homieswardrobe.com. Include your order number and the reason for the return.',
  },
  {
    step: '02',
    title: 'Pack & Ship',
    body: 'Carefully repack the item(s) in their original packaging with tags still attached. Unused, unwashed, and undamaged items only. Drop the parcel at your nearest courier point. We recommend using a trackable shipping service.',
  },
  {
    step: '03',
    title: 'Inspection',
    body: 'Once your return reaches us, our team will inspect the item within 2–3 business days and confirm that it meets our return conditions.',
  },
  {
    step: '04',
    title: 'Refund Processed',
    body: 'Approved refunds are credited back to your original payment method within 7–10 business days. You will receive a confirmation email once the refund has been issued.',
  },
];

const conditions = [
  'Item must be returned within 14 days of the delivery date.',
  'Items must be unused, unwashed, and in their original condition.',
  'Original packaging and all tags must be intact.',
  'Sale items, lingerie, and customised/personalised products are non-returnable.',
  'Shipping costs for returns are borne by the customer unless the item was defective or incorrect.',
  'HOMIESWARDROBE reserves the right to reject any return that does not meet our conditions.',
];

export function Returns() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Return & Refund Policy' }]} />

      <section className="mb-16 max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Customer Care</p>
        <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight md:text-6xl">Return & Refund Policy</h1>
        <p className="mt-5 max-w-2xl text-lg text-secondary">
          Not the right fit? We make returns straightforward. Follow the steps below to initiate a return.
        </p>
      </section>

      {/* Steps */}
      <section className="mb-20">
        <h2 className="text-2xl font-heading font-semibold uppercase tracking-tight mb-8">How to Return</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ step, title, body }) => (
            <div key={step} className="border-t-2 border-black pt-6">
              <span className="text-4xl font-bold text-gray-100 font-heading">{step}</span>
              <h3 className="text-lg font-semibold mt-2 mb-2">{title}</h3>
              <p className="text-sm text-secondary leading-6">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Conditions */}
      <section className="mb-20 max-w-3xl">
        <h2 className="text-2xl font-heading font-semibold uppercase tracking-tight mb-6">Return Conditions</h2>
        <ul className="space-y-3">
          {conditions.map((c) => (
            <li key={c} className="flex items-start gap-3 text-sm text-secondary leading-6">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* Contact */}
      <section className="rounded-3xl bg-section p-8 max-w-2xl">
        <h2 className="text-xl font-heading font-semibold mb-2">Need help with a return?</h2>
        <p className="text-sm text-secondary mb-4">Our support team is here to assist. Contact us and we'll guide you through the process.</p>
        <a
          href="/contact"
          className="inline-flex items-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
        >
          Contact Support
        </a>
      </section>
    </div>
  );
}
