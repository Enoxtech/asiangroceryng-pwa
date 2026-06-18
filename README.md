# Asian Grocery NG — PWA

A modern, mobile-first Progressive Web App for Asian Grocery NG — delivering authentic Asian groceries across Nigeria.

## Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16 App Router | Framework |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling |
| Zustand | Cart & wishlist state |
| PWA Manifest | App install + offline |

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
# Open http://localhost:3000
```

## Build & Deploy

```bash
npm run build
npm start
# Or: npx vercel
```

## Folder Structure

```
asiangroceryng-pwa/
├── app/                    Next.js App Router pages
│   ├── page.tsx            Home
│   ├── shop/               Product listing + detail
│   ├── cart/               Cart page
│   ├── checkout/           Checkout
│   ├── order-success/      Order confirmation
│   ├── account/            Login / orders
│   ├── wishlist/           Saved products
│   ├── track-order/        Order tracking
│   ├── contact/            Contact
│   ├── deals/              Sale products
│   ├── offline/            PWA offline fallback
│   └── admin/              Admin panel
├── components/layout/      Header, Footer, BottomNav, CartDrawer
├── components/product/     ProductCard, ProductGrid
├── components/home/        Hero, CategoryChips, etc.
├── components/ui/          Badge, Button
├── data/                   Mock products & categories
├── store/                  Zustand cart + wishlist
├── types/                  TypeScript interfaces
├── lib/                    Utilities
└── public/manifest.json    PWA manifest
```

## PWA Icons

Add `public/icons/icon-192.png` and `public/icons/icon-512.png`.
Generate at https://favicon.io using the 🥡 emoji or your logo.

## Admin

Visit `/admin` — currently uses mock data. Supabase integration in Phase 2.

## Next Steps

See `TODO.md` for the full 9-phase development roadmap.
