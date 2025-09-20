
# Viquoe Procurement Hub

Viquoe Procurement Hub is a modern, multi-role procurement management platform built with Next.js and TypeScript. It streamlines purchasing, supplier management, order processing, and financial operations for organizations, supporting buyers, suppliers, and administrators with dedicated dashboards and workflows.

## Features

- Multi-role dashboards: Admin, Buyer, Supplier, Financial
- Product catalog, cart, and order management
- Invoice and payment tracking
- Authentication (login/register)
- Responsive UI with reusable components
- Built with Next.js App Router and TypeScript
- Styled with Tailwind CSS and Radix UI primitives

## Folder Structure

```
├── app/                  # Next.js app directory (routing, pages, layouts)
│   ├── admin-dashboard/  # Admin dashboard pages
│   ├── buyer-dashboard/  # Buyer dashboard pages
│   ├── buyer-portal/     # Buyer portal
│   ├── cart/             # Cart and checkout
│   ├── financial-dashboard/ # Financial dashboard
│   ├── invoices/         # Invoice management
│   ├── login/            # Login page
│   ├── orders/           # Order details
│   ├── payment/          # Payment pages
│   ├── register/         # Registration page
│   ├── supplier-dashboard/ # Supplier dashboard
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # Reusable React components
│   ├── ui/               # UI primitives (button, card, table, etc.)
│   ├── auth-provider.tsx # Auth context/provider
│   └── theme-provider.tsx# Theme context/provider
├── lib/                  # Utility functions
├── public/               # Static assets (images, logos)
├── styles/               # Additional global styles
├── package.json          # Project metadata and scripts
├── next.config.mjs       # Next.js configuration
├── tsconfig.json         # TypeScript configuration
└── postcss.config.mjs    # PostCSS/Tailwind config
```

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Vercel](https://vercel.com/) (deployment)

## Getting Started

1. **Install dependencies** (using [pnpm](https://pnpm.io/)):
	```bash
	pnpm install
	```

2. **Run the development server:**
	```bash
	pnpm dev
	```
	Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for production:**
	```bash
	pnpm build
	pnpm start
	```

## Deployment

This project is configured for seamless deployment on [Vercel](https://vercel.com/). Push to the main branch to trigger automatic deployments.

## License

This project is proprietary to VIQUOE. All rights reserved.
