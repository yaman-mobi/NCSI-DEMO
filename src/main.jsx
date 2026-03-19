import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

// Log deployed version/config so you can verify prod configs in production
const env = import.meta.env
const version = env.PROD ? 'prod' : 'dev'
console.log(`[NCSI Demo] Deployed version: ${version}`, {
  mode: env.MODE,
  prod: env.PROD,
  dev: env.DEV,
  baseUrl: env.BASE_URL || '/',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
