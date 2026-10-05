import { Breadcrumb } from '../components/Breadcrumb';
import { Card } from '../components/ui/Card';

const groups = [
  ['Orders', [['How can I track my order?', 'Order status is available in Account > Orders after you sign in. This project does not connect to live courier tracking.'], ['Can I cancel my order?', 'Contact support as soon as possible. Cancellation depends on the order status.'], ['Can I change my delivery address?', 'Contact support quickly after placing the order; changes depend on processing status.']]],
  ['Shipping', [['How long does delivery take?', 'Shipping timelines in this student project are demonstration estimates shown around checkout.'], ['Do you deliver across India?', 'The checkout is configured for Indian addresses and INR store settings.']]],
  ['Returns', [['Can I return an item?', 'Returns are handled as a demo support workflow. Contact us with your order details.'], ['How do I request a return?', 'Use the Contact page and include your order number and the reason for your request.']]],
  ['Products', [['How do I choose the correct size?', 'Use the general Size Guide and check the available sizes and fit information on each product page.'], ['Are product colors exactly the same as shown?', 'Screens and lighting can vary, so colors may look slightly different in person.']]],
  ['Account', [['Do I need an account to shop?', 'You can browse and add items to your cart without an account. Login is required at checkout.'], ['How can I view previous orders?', 'Sign in and open Account > Orders.']]],
  ['AI Stylist', [['What is the AI Stylist?', 'It matches your selected gender, style, occasion, color, fit, and budget to real in-stock products.'], ['Does it recommend real HOMIESWARDROBE products?', 'Yes. Recommendations come from the MongoDB product catalog and can be added to your cart.']]],
];

export function FAQ() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'FAQ' }]} />
      <Card>
        <h1 className="text-3xl font-heading font-semibold mb-3">Frequently asked questions</h1>
        <p className="mb-8 text-sm text-secondary">Useful answers for the HOMIESWARDROBE shopping experience.</p>
        <div className="space-y-10">{groups.map(([title, faqs]) => <section key={title}><h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-secondary">{title}</h2><div className="space-y-3">{faqs.map(([question, answer]) => <details key={question} className="rounded-2xl border border-gray-200 p-4"><summary className="cursor-pointer text-sm font-semibold">{question}</summary><p className="mt-3 text-sm leading-6 text-secondary">{answer}</p></details>)}</div></section>)}</div>
      </Card>
    </div>
  );
}
