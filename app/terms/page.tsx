import Link from 'next/link';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: [
      'By accessing or using the Asian Grocery Nigeria website or app, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.',
    ],
  },
  {
    title: '2. Orders & Payment',
    body: [
      'All orders are subject to product availability. We reserve the right to limit quantities, refuse, or cancel any order at our discretion — for example, in cases of suspected fraud or pricing errors.',
      'We accept secure Paystack payments and manual bank transfers to our displayed business account. Bank-transfer orders remain awaiting payment until an administrator verifies that the transfer has been received; placing an order does not by itself confirm payment.',
      'Prices are listed in Nigerian Naira (₦) and may change without prior notice. The price charged will be the price displayed at the time your order is placed.',
    ],
  },
  {
    title: '3. Delivery',
    body: [
      'Delivery fees and estimated timelines vary by area and are shown at checkout. Delivery times are estimates and not guaranteed — delays may occur due to traffic, weather, or circumstances beyond our control.',
      'Store pickup is available at Store F11, Ikeja Town-Square, Lagos during posted business hours.',
      'It is your responsibility to provide an accurate delivery address and a reachable phone number. We are not liable for failed deliveries due to incorrect contact information.',
    ],
  },
  {
    title: '4. Returns, Refunds & Cancellations',
    body: [
      'Due to the perishable nature of many grocery items, we do not accept returns once an order has been delivered, except where the item received is damaged, expired, or incorrect.',
      'If you receive a damaged, expired, or wrong item, contact us within 24 hours of delivery via WhatsApp or email with photos of the item, and we will arrange a replacement or refund at our discretion.',
      'Orders may be cancelled free of charge before they are dispatched. Once an order is out for delivery, it can no longer be cancelled.',
    ],
  },
  {
    title: '5. Promo Codes & Discounts',
    body: [
      'Promotional codes are subject to the terms stated at the time of issue (such as minimum order value) and may be withdrawn or modified at any time without notice. Only one promo code may be applied per order unless stated otherwise.',
    ],
  },
  {
    title: '6. Account Responsibility',
    body: [
      'If you create an account, you are responsible for maintaining the confidentiality of your login details and for all activity that occurs under your account.',
    ],
  },
  {
    title: '7. Limitation of Liability',
    body: [
      'Asian Grocery Nigeria is not liable for any indirect, incidental, or consequential damages arising from your use of our website, app, or products, to the fullest extent permitted by law.',
      'Our total liability for any claim related to an order is limited to the amount paid for that order.',
    ],
  },
  {
    title: '8. Intellectual Property',
    body: [
      'All content on this site — including text, images, logos, and design — is the property of Asian Grocery Nigeria and may not be copied or reused without permission.',
    ],
  },
  {
    title: '9. Governing Law',
    body: [
      'These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes will be subject to the exclusive jurisdiction of the courts of Lagos State.',
    ],
  },
  {
    title: '10. Changes to These Terms',
    body: [
      'We may update these Terms from time to time. Continued use of our services after changes are posted constitutes your acceptance of the revised Terms.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-label uppercase tracking-widest text-[var(--accent)]">Legal</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display">Terms of Service</h1>
        <p className="text-sm text-[var(--text-muted)] font-display">Effective Date: 17 July 2026</p>
        <p className="text-[var(--text-secondary)] leading-relaxed font-body">
          These Terms of Service (&quot;Terms&quot;) govern your use of the Asian Grocery Nigeria website and app, and your
          purchase of products from us. Please read them carefully before placing an order.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map(({ title, body }) => (
          <div key={title} className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">{title}</h2>
            {body.map((p, i) => (
              <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed font-body">{p}</p>
            ))}
          </div>
        ))}
      </div>

      <div className="rounded-[24px] p-6 glass border border-[var(--border-color)] space-y-1">
        <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">Contact Us</h2>
        <p className="text-sm text-[var(--text-secondary)] font-body">
          Questions about these Terms? Reach us at{' '}
          <a href="mailto:asiangroceryng@gmail.com" className="text-[var(--accent)] font-semibold">asiangroceryng@gmail.com</a>{' '}
          or <a href="tel:+2347076930636" className="text-[var(--accent)] font-semibold">+234 707 693 0636</a>, or visit
          our <Link href="/contact" className="text-[var(--accent)] font-semibold">Contact page</Link>. See also our{' '}
          <Link href="/privacy" className="text-[var(--accent)] font-semibold">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
