import { Breadcrumb } from '../components/Breadcrumb';

const sections = [
  {
    title: 'Information We Collect',
    body: 'When you create an account or place an order on HOMIESWARDROBE, we collect personal information such as your name, email address, delivery address, and payment details. We also collect browsing data, device information, and cookies to improve your shopping experience.',
  },
  {
    title: 'How We Use Your Information',
    body: 'Your information is used to process and deliver your orders, send order confirmations and shipping updates, personalise your shopping experience through our AI Stylist feature, and communicate important account and promotional information. We never sell your personal data to third parties.',
  },
  {
    title: 'Cookies',
    body: 'We use essential cookies to keep your cart and session active, and analytics cookies to understand how customers use our store. You can manage cookie preferences through your browser settings at any time.',
  },
  {
    title: 'Data Security',
    body: 'We use industry-standard encryption (HTTPS/TLS) to protect your data in transit. Passwords are stored as secure hashes and are never stored in plain text. Payment card details are processed through PCI-compliant payment providers and are never stored on our servers.',
  },
  {
    title: 'Data Retention',
    body: 'We retain your account and order data for as long as your account remains active or as required by applicable law. You may request deletion of your personal data at any time by contacting our support team.',
  },
  {
    title: 'Your Rights',
    body: 'You have the right to access, correct, or delete any personal information we hold about you. You may also request a copy of your data or withdraw consent to marketing communications at any time. Contact us at privacy@homieswardrobe.com to exercise any of these rights.',
  },
  {
    title: 'Third-Party Services',
    body: 'We may use trusted third-party services for payment processing, shipping logistics, and analytics. These partners are contractually required to keep your data secure and to use it only for the specific purpose for which it was shared.',
  },
  {
    title: 'Changes to This Policy',
    body: 'We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of the page and notify registered users by email if the changes are significant.',
  },
];

export function Privacy() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Privacy Policy' }]} />
      <section className="mb-14 max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-secondary">Legal</p>
        <h1 className="text-4xl font-heading font-semibold uppercase tracking-tight md:text-6xl">Privacy Policy</h1>
        <p className="mt-5 max-w-2xl text-lg text-secondary">
          How HOMIESWARDROBE collects, uses, and protects your personal information.
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
