# RealData Portal

A full-stack data portal UI based on the [RealData Portal Figma design](https://www.figma.com/design/eoRswB7HVwDzioFqhW9kf8/RealData-Portal?node-id=151-82).

## Stack

- **React 18** + **Vite**
- **React Router** for navigation
- **Tailwind CSS** for styling

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/components/` – Layout, Sidebar, Header
- `src/pages/` – Dashboard, Data Explorer, Reports, Settings
- `src/App.jsx` – Routes

To match the Figma design pixel-perfect, adjust colors and spacing in `tailwind.config.js` and component classes using your design tokens.
