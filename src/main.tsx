import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import './styles/index.css'
import './i18n' // khởi tạo i18n (side-effect)

createRoot(document.getElementById('root')!).render(<App />)
