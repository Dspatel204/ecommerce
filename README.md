# Ecommerce Store

A React-based ecommerce product store with a QR/barcode scanner, a full GST billing system, dark/light mode, and a responsive, professional UI built with **Tailwind CSS**.

## Features

- **Product Store** — Browse products fetched from the DummyJSON API in a responsive Tailwind grid (1 → 4 columns). Each product card shows the image, title, price, description, and an **Add to Cart** button.
- **Cart** — A shared cart (via React Context) that can be opened from the header badge or the page's "View Cart" button. The cart modal uses a slick carousel to preview items, with per-item **Remove** actions.
- **Dark / Light Mode** — A class-based theme toggle (Sun/Moon) in the header. The preference is persisted to `localStorage` and respects the OS `prefers-color-scheme`. Works across the whole app.
- **Header + Routing** — A sticky, responsive header with logo, navigation links, dark-mode toggle, and cart badge. Pages are wired up with `react-router` (v6):
  - `/` — Home (hero + quick links)
  - `/products` — Product Store
  - `/categories` — Product categories fetched from the API
  - `/qr-code` — QR / Barcode scan + GST bill
- **GST Billing** — On the QR Code page, a full **GST bill sample is displayed first** (brand name, GSTIN, business & customer details, item table with Qty/Price/GST/GST Amt/Total, GST breakdown, and Grand Total), then a **Download GST Bill (PDF)** button generates a properly styled `gst-invoice.pdf` using `jspdf` + `jspdf-autotable`.
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

## Project Structure

```
src/
├── App.js                  # Router layout (Header + Outlet)
├── index.js                # Redux + BrowserRouter + ThemeProvider entry
├── styles.css              # Tailwind directives + @layer components
├── components/
│   ├── Header.jsx          # Sticky header (nav, dark toggle, cart)
│   └── GSTBillSample.jsx   # GST bill preview + styled PDF download
├── pages/
│   ├── Home.jsx
│   ├── Products.jsx        # renders the product store
│   ├── Categories.jsx
│   └── QRCode.jsx          # GST bill sample + download
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
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
npm install
```

### Available Scripts

```bash
npm start      # development server at http://localhost:3000
npm run build  # production build (output in build/)
npm test       # runs the test watcher
```

## Tailwind Configuration

Tailwind is configured in `tailwind.config.js` with `darkMode: "class"`, a custom `primary`/`secondary`/`accent` color palette, and content scanning across `src/**/*.{js,jsx,ts,tsx}` and `public/index.html`. PostCSS is wired via `postcss.config.js` so CRA processes Tailwind during build.

## Notes

- The development build shows a pre-existing `babel-preset-react-app` warning about `@babel/plugin-proposal-private-property-in-object`; it is unrelated to these features and does not affect the build.
- The QR/barcode scanner requires camera permissions; the bill download works without a camera.
