import Link from 'next/link';

const sections = [
  {
    title: '1. Information We Collect',
    body: [
      'When you place an order, create an account, or contact us, we collect information you provide directly — such as your name, phone number, email address, delivery address, and order details.',
      'We also automatically store certain data on your device (via your browser\'s local storage) to make the app work — your cart contents, wishlist, theme preference, and notification history. This data stays on your device and is not transmitted to our servers unless you complete a checkout.',
      'We do not collect or store your debit/credit card numbers. Card payments are processed directly by our payment partners (Paystack, Flutterwave), who maintain their own security and privacy standards.',
    ],
  },
  {
    title: '2. How We Use Your Information',
    body: [
      'To process and deliver your orders, including sharing your name, phone number, and delivery address with our delivery team.',
      'To send order confirmations and updates via email, WhatsApp, or in-app notifications.',
      'To respond to customer service enquiries and improve our products and service.',
      'To send occasional promotional offers, discount codes, or product updates — you can opt out at any time by contacting us.',
    ],
  },
  {
    title: '3. How We Share Your Information',
    body: [
      'We do not sell or rent your personal information to third parties.',
      'We share only what is necessary with trusted service providers who help us operate the store — for example, payment processors (Paystack, Flutterwave) for card transactions, and delivery partners for order fulfilment.',
      'We may disclose information if required by law or to protect the rights, property, or safety of Asian Grocery Nigeria, our customers, or others.',
    ],
  },
  {
    title: '4. Data Storage & Security',
    body: [
      'Your order and account information is stored securely using industry-standard practices. Bank transfer details you submit as proof of payment are shared with us directly via WhatsApp and are used only to confirm your order.',
      'While we take reasonable steps to protect your information, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    title: '5. Your Rights',
    body: [
      'You have the right to access, correct, or request deletion of your personal information at any time. You can do this by contacting us directly using the details below.',
      'You may also opt out of marketing communications at any time without affecting your ability to place orders.',
    ],
  },
  {
    title: '6. Cookies & Local Storage',
    body: [
      'We use your browser\'s local storage (not third-party tracking cookies) to remember your cart, wishlist, theme preference, and login session, so the app works smoothly across visits.',
      'You can clear this data at any time by clearing your browser\'s site data, though this will also clear your cart and saved preferences.',
    ],
  },
  {
    title: '7. Children\'s Privacy',
    body: [
      'Our services are intended for users who are at least 18 years old or are placing orders under the supervision of a parent or guardian. We do not knowingly collect personal information from children.',
    ],
  },
  {
    title: '8. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Updates will be posted on this page with a revised effective date.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-2">
        <p className="text-xs font-label uppercase tracking-widest text-[var(--accent)]">Legal</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display">Privacy Policy</h1>
        <p className="text-sm text-[var(--text-muted)] font-display">Effective Date: 22 June 2026</p>
        <p className="text-[var(--text-secondary)] leading-relaxed font-body">
          Asian Grocery Nigeria (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) respects your privacy. This policy explains what
          information we collect when you use our website and app, how we use it, and the choices you have. By using
          Asian Grocery Nigeria, you agree to the practices described below.
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
          Questions about this Privacy Policy or your personal information? Reach us at{' '}
          <a href="mailto:asiangroceryng@gmail.com" className="text-[var(--accent)] font-semibold">asiangroceryng@gmail.com</a>{' '}
          or <a href="tel:+2347076930636" className="text-[var(--accent)] font-semibold">+234 707 693 0636</a>, or visit
          our <Link href="/contact" className="text-[var(--accent)] font-semibold">Contact page</Link>.
        </p>
      </div>
    </div>
  );
}
