'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Mail, Phone, Clock, MapPin, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getWhatsAppSupportUrl } from '@/lib/utils';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [hours, setHours] = useState({ weekdays: '8:00 AM – 7:00 PM WAT', saturday: '9:00 AM – 5:00 PM WAT', sunday: 'Closed' });

  useEffect(() => {
    fetch('/api/settings/public')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setHours({
          weekdays: data.businessHoursWeekdays || hours.weekdays,
          saturday: data.businessHoursSaturday || hours.saturday,
          sunday: data.businessHoursSunday || hours.sunday,
        });
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const contactInfo = [
    { Icon: Phone, label: 'Phone', value: '+2347076930636', href: 'tel:+2347076930636' },
    { Icon: Mail, label: 'Email', value: 'asiangroceryng@gmail.com', href: 'mailto:asiangroceryng@gmail.com' },
    { Icon: Clock, label: 'Business Hours', value: `Mon–Fri: ${hours.weekdays} · Sat: ${hours.saturday} · Sun: ${hours.sunday}`, href: null },
    { Icon: MapPin, label: 'Location', value: 'Store F11 Ikeja Town-Square Alausa, Lagos', href: 'https://maps.google.com/?q=131+Obafemi+Awolowo+way+Ikeja+Lagos' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not send your message');
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-10 space-y-2">
        <p className="text-xs font-label uppercase tracking-widest text-[var(--accent)]">Get in Touch</p>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] font-display">Contact Us</h1>
        <p className="text-[var(--text-secondary)] font-display">Have a question or need help with your order? We&apos;re here for you.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: contact options */}
        <div className="space-y-4">
          {/* WhatsApp CTA */}
          <a
            href={getWhatsAppSupportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 rounded-[24px] transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: '#25D366', color: 'white' }}
          >
            <div className="h-12 w-12 rounded-[18px] flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold font-display">WhatsApp (Fastest)</p>
              <p className="text-sm opacity-80 font-display">Usually replies within 30 minutes</p>
            </div>
          </a>

          {/* Contact details */}
          <div className="space-y-3">
            {contactInfo.map(({ Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-[20px] glass border border-[var(--border-color)]">
                <div className="h-10 w-10 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: 'var(--surface-raised)' }}>
                  <Icon className="h-4 w-4 text-[var(--text-secondary)]" />
                </div>
                <div>
                  <p className="text-[10px] font-label uppercase tracking-widest text-[var(--text-muted)] mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-medium text-[var(--text-primary)] hover:text-brand-red transition-colors font-display">{value}</a>
                  ) : (
                    <p className="text-sm font-medium text-[var(--text-primary)] font-display">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="rounded-[28px] glass border border-[var(--border-color)] p-6">
          {sent ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-12">
              <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.12)' }}>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <div>
                <p className="font-bold text-[var(--text-primary)] text-lg font-display">Message Sent!</p>
                <p className="text-[var(--text-secondary)] text-sm mt-1 font-display">We&apos;ll get back to you within 24 hours.</p>
              </div>
              <Button onClick={() => setSent(false)} variant="outline" size="md">Send Another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-bold text-[var(--text-primary)] font-display mb-2">Send a Message</h2>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-display">{error}</div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display"
                  />
                </div>
                <div>
                  <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@email.com"
                    className="w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display"
                >
                  <option value="">Select a topic</option>
                  <option>Order enquiry</option>
                  <option>Product availability</option>
                  <option>Delivery issue</option>
                  <option>Payment issue</option>
                  <option>General question</option>
                  <option>Bulk / wholesale order</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Message *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we help you?"
                  rows={5}
                  className="w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none font-display"
                />
              </div>
              <Button type="submit" loading={loading} size="lg" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
