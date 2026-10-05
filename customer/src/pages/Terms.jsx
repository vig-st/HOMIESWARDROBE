import { Breadcrumb } from '../components/Breadcrumb';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing or using the HOMIESWARDROBE website and services, you confirm that you are at least 18 years of age (or have parental consent) and agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use of our services immediately.',
  },
  {
    title: '2. Account Responsibilities',
    body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Please notify us immediately at support@homieswardrobe.com if you suspect any unauthorised access to your account.',
  },
  {
    title: '3. Products and Pricing',
    body: 'All products are subject to availability. We reserve the right to modify or discontinue any product at any time without notice. Prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to adjust prices at any time.',
  },
  {
    title: '4. Order Acceptance',
    body: 'Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. Orders are confirmed by email. HOMIESWARDROBE is not responsible for typographic errors in pricing or product descriptions and reserves the right to cancel orders placed in error.',
  },
  {
    title: '5. Payment',
    body: 'We accept all major payment methods as presented at checkout. By submitting payment, you represent that you are authorised to use the selected payment method. All transactions are secured through encryption and processed by PCI-compliant payment partners.',
  },
  {
    title: '6. Shipping and Delivery',
    body: 'Estimated delivery timelines are provided at checkout and are not guaranteed. HOMIESWARDROBE is not responsible for delays caused by external logistics partners, customs, natural disasters, or other unforeseen events.',
  },
  {
    title: '7. Returns and Refunds',
    body: 'Products may be returned within 14 days of delivery provided they are unused, unwashed, and in original packaging with tags attached. Sale items and personalised products are non-returnable. Refunds are processed within 7–10 business days of receiving the returned item.',
  },
  {
    title: '8. Intellectual Property',
    body: 'All content on this website — including text, images, logos, and design — is the property of HOMIESWARDROBE and is protected by applicable copyright and trademark laws. Unauthorised reproduction or distribution of any content is strictly prohibited.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'HOMIESWARDROBE shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our total liability to you for any claim shall not exceed the amount paid for the order in question.',
  },
  {
    title: '10. Governing Law',
    body: 'These Terms are governed by the laws of India. Any dispute arising from your use of HOMIESWARDROBE shall be subject to the exclusive jurisdiction of courts located in India.',
  },
];

export function Terms() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Terms & Conditions' }]} />
      <section className="mb-14 max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Legal</p>
        <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight md:text-6xl">Terms & Conditions</h1>
        <p className="mt-5 max-w-2xl text-lg text-secondary">
          Please read these terms carefully before using HOMIESWARDROBE.
          <span className="block mt-2 text-sm">Effective Date: September 2026</span>
        </p>
      </section>
      <div className="grid gap-x-12 md:grid-cols-2">
        {sections.map(({ title, body }) => (
          <article key={title} className="border-t border-gray-200 py-8">
            <h2 className="text-xl font-heading font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-secondary">{body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
