# Asian Grocery NG — Development Roadmap

## Phase 1 — MVP (DONE ✅)
- [x] Next.js App Router + TypeScript + Tailwind CSS v4
- [x] Mobile-first responsive layout
- [x] PWA manifest + offline page
- [x] Cart state with Zustand (persisted to localStorage)
- [x] Wishlist state with Zustand (persisted to localStorage)
- [x] Home page (hero, categories, product sections, country collections)
- [x] Shop page with filters, sort, search
- [x] Product detail page (gallery, details, WhatsApp order)
- [x] Cart page + cart drawer
- [x] Checkout with form + payment placeholders
- [x] Order success page
- [x] Account/login page (UI only)
- [x] Wishlist page
- [x] Order tracking page (real lookup by order ID + phone)
- [x] Contact page
- [x] Deals page
- [x] Admin dashboard (mock data)
- [x] Admin product management (table + form)
- [x] Admin orders management
- [x] Admin customers list
- [x] 20 mock products + 12 categories
- [x] PWA install prompt component
- [x] Bottom mobile navigation
- [x] WhatsApp order fallback

---

## Phase 2 — Backend Integration
- [ ] Set up Supabase project
- [ ] Products table, categories table in Supabase
- [ ] Migrate mock products to Supabase
- [ ] Supabase auth (email + password)
- [ ] Customer profiles table
- [ ] Orders table + order items
- [ ] Admin: real product create/edit/delete with Supabase
- [ ] Admin: real order status updates
- [ ] Supabase Storage for product image upload
- [ ] Server-side product fetching (ISR)
- [ ] Row-level security (RLS) policies

## Phase 3 — Payments
- [ ] Integrate Paystack (cards, USSD, bank transfer)
- [ ] Integrate Flutterwave as backup
- [ ] Payment webhook handling (Supabase Edge Function)
- [ ] Automatic order confirmation after payment
- [ ] Payment receipt email (Supabase + Resend)

## Phase 4 — Order Management
- [ ] Real order tracking system
- [ ] WhatsApp notification via API when order ships
- [ ] Admin: bulk order status update
- [ ] Delivery zone map (Lagos areas)
- [ ] Automated order confirmation email

## Phase 5 — Customer Experience
- [ ] Product reviews & ratings
- [ ] Recently viewed (localStorage → Supabase)
- [ ] Loyalty points system
- [ ] Referral code system
- [ ] Customer dashboard (orders, addresses, wishlist)
- [ ] Address book (multiple saved addresses)

## Phase 6 — PWA Enhancements
- [ ] Push notifications (order updates)
- [ ] Background sync (offline order queuing)
- [ ] App install prompt analytics
- [ ] Service worker caching strategy

## Phase 7 — SEO & Performance
- [ ] Dynamic sitemap.xml
- [ ] Product structured data (JSON-LD)
- [ ] Image optimization (WebP, CDN)
- [ ] Core Web Vitals audit

## Phase 8 — Admin Enhancements
- [ ] Coupon/discount management
- [ ] Bulk stock update
- [ ] Category management
- [ ] Sales analytics dashboard
- [ ] Inventory alerts (email/WhatsApp when low)
- [ ] Export orders to CSV

## Phase 9 — Advanced Features
- [ ] Product bundling / deals
- [ ] Wholesale/bulk ordering flow
- [ ] Gift wrapping option
- [ ] Instagram shopping integration
- [ ] WhatsApp order bot automation
