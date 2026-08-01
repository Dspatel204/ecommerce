# Ecommerce Store

A React-based ecommerce product store with a QR/barcode scanner, a full GST billing system, a one-page **Checkout + Razorpay** payment flow, dark/light mode, and a responsive, professional UI built with **Tailwind CSS**.

## Features

- **Product Store** — Browse products fetched from the DummyJSON API in a responsive Tailwind grid (1 → 4 columns). Each product card shows the image, title, price, description, and an **Add to Cart** button. Products are loaded with **pagination** (16 per page).
- **Cart** — A shared cart (via React Context) that can be opened from the header badge or the page's "View Cart" button. The cart modal uses a slick carousel to preview items, with per-item **Remove** actions.
- **Dark / Light Mode** — A class-based theme toggle (Sun/Moon) in the header. The preference is persisted to `localStorage` and respects the OS `prefers-color-scheme`. Works across the whole app.
- **Header + Routing** — A sticky, responsive header with logo, navigation links, dark-mode toggle, and cart badge. Pages are wired up with `react-router` (v6):
  - `/` — Home (hero + quick links)
  - `/products` — Product Store (paginated)
  - `/categories` — Product categories; select one to browse its products (paginated)
  - `/qr-code` — QR / Barcode scan + GST bill
  - `/checkout` — One-page checkout + Razorpay payment
- **GST Billing** — On the QR Code page, a full **GST bill sample is displayed first** (brand name, GSTIN, business & customer details, item table with S.No / Qty / Price / GST% / GST Amt / Total, GST breakdown, and a colored Grand Total), then a **Download GST Bill (PDF)** button generates a properly styled `gst-invoice.pdf` using `jspdf` + `jspdf-autotable`.
- **Checkout + Razorpay** — One-page checkout (`src/pages/Checkout.jsx`) with a billing form (name, email, phone, address, pincode, city), live order summary from the shared cart, form validation, and a **Pay with Razorpay** button. The Razorpay Checkout script is loaded on demand (`src/utils/razorpay.js`) and orders are created securely by a serverless/Express backend (`/api/create-order`) using the `razorpay` SDK.
- **QR / Barcode Scanner** — Barcode scanning flow powered by `react-barcode-scanner` (see `src/features/counter/BillingApp.js`).

## Demo

```
Brand        : ABC Electronics Store
GSTIN        : 07AABCU9603R1ZM
Address      : 123 Business Street, Surat, Gujarat - 395003
Phone        : +91 98765 43210
```

## Tech Stack

- **React 18** (hooks, functional components)
- **React Router v6** — routing + layout
- **Tailwind CSS 3** (`darkMode: "class"`) — styling
- **MUI (Material UI)** — modal + data grid components
- **react-redux** / **@reduxjs/toolkit** — state
- **react-barcode-scanner** — camera scanning
- **slick-carousel** — carousel
- **jsPDF** + **jspdf-autotable** — GST bill PDF export
- **lucide-react** — icons
- **axios** — API calls
- **formik** + **yup** — forms/validation
- **Razorpay** SDK — order creation (server-side)
- **Express** + **cors** — local dev backend (`server.js`)

## Project Structure

```
src/
├── App.js                  # Router layout (Header + Outlet)
├── index.js                # Redux + BrowserRouter + ThemeProvider entry
├── styles.css              # Tailwind directives + @layer components
├── components/
│   ├── Header.jsx          # Sticky header (nav, dark toggle, cart)
│   ├── GSTBillSample.jsx   # GST bill preview + styled PDF download
│   ├── Pagination.jsx      # Reusable dark-aware pagination
│   └── ui/
├── pages/
│   ├── Home.jsx
│   ├── Products.jsx        # renders the (paginated) product store
│   ├── Categories.jsx      # category grid + paginated category products
│   ├── QRCode.jsx          # GST bill sample + download
│   └── Checkout.jsx        # Checkout + Razorpay payment
├── utils/
│   └── razorpay.js         # dynamically loads the Razorpay Checkout script
├── context/
│   ├── ThemeContext.jsx    # dark/light mode provider
│   └── CartContext.jsx     # shared cart state + modal controls
├── features/counter/
│   ├── CartPage.js         # product grid + cart modal
│   ├── Counter.js
│   ├── BillingApp.js       # QR/barcode scanner + billing logic
│   ├── Blogs.js
│   └── ...
├── app/store.js
├── tailwind.config.js
└── postcss.config.js

server.js                  # Local Express backend (POST /api/create-order)
api/create-order.js        # Vercel serverless function (same endpoint)
vercel.json                # Vercel build + function config
.env.example               # Razorpay env var template (.env is gitignored)
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- A [Razorpay](https://dashboard.razorpay.com) test account

### Installation

```bash
npm install
```

### Available Scripts

```bash
npm start      # development server at http://localhost:3000
npm run build  # production build (output in build/)
npm run server # backend server (http://localhost:5000)
npm run dev    # runs frontend + backend together (concurrently)
npm test       # runs the test watcher
```

## Tailwind Configuration

Tailwind is configured in `tailwind.config.js` with `darkMode: "class"`, a custom `primary`/`secondary`/`accent` color palette, and content scanning across `src/**/*.{js,jsx,ts,tsx}` and `public/index.html`. PostCSS is wired via `postcss.config.js` so CRA processes Tailwind during build.

## Checkout & Razorpay (Payment Gateway)

The checkout uses **Razorpay Checkout** in embedded/popup mode. The frontend calls `/api/create-order` (a relative URL) to create an order; creating an order requires your secret key, so it is handled by a backend.

- **Local dev:** CRA's `proxy` field (`./package.json → "proxy": "http://localhost:5000"`) forwards `/api/*` to the Express `server.js` on port 5000.
- **Vercel:** the same endpoint is served by the `api/create-order.js` serverless function (declared in `vercel.json`), so no separate backend host is needed.

Local setup:

1. `npm install`
2. Create a `.env` file from `.env.example` and fill in your **test** credentials:
   ```env
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID   # client-side
   RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID             # server-side
   RAZORPAY_KEY_SECRET=YOUR_SECRET_KEY              # server-side (keep private)
   ```
3. `npm run dev` (frontend on `http://localhost:3000`, backend on `http://localhost:5000`).
4. Open `/checkout`, add items to the cart, fill the billing form, and click **Pay with Razorpay** to open the embedded checkout.

### Deployment (Vercel)

1. Connect/import the repo to [Vercel](https://vercel.com/import).
2. In **Project Settings → Environment Variables**, add:
   - `REACT_APP_RAZORPAY_KEY_ID` → your key id (available client-side)
   - `RAZORPAY_KEY_ID` → your key id (server-side)
   - `RAZORPAY_KEY_SECRET` → your secret (server-side only)
3. Vercel auto-builds the CRA app (`npm install && npm run build`, output `build/`) and deploys `api/create-order.js` (declared in `vercel.json`) as a serverless function at `/api/create-order`.
4. Open `/checkout`, add items, fill the billing form, and click **Pay with Razorpay** to open the embedded checkout.

> To run the backend locally **without** Express (using the same function the cloud uses), run `npx vercel dev`.

## Notes

- The development build shows a pre-existing `babel-preset-react-app` warning about `@babel/plugin-proposal-private-property-in-object`; it is unrelated to these features and does not affect the build.
- The QR/barcode scanner requires camera permissions; the bill download and checkout work without a camera.
