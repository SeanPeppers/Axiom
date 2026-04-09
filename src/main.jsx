import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SizeProvider } from './contexts/SizeContext.jsx'

createRoot(document.getElementById('root')).render(
  <SizeProvider>
    <App />
  </SizeProvider>
)
