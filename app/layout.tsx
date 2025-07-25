import './globals.scss'
import 'leaflet/dist/leaflet.css'
import { ReactNode } from 'react'
import Navbar from '../app/components/Navbar'
import Footer from '../app/components/Footer'
import { AuthProvider } from './auth/AuthContext'
import ToastProvider from './ToastProvider'
import 'react-toastify/dist/ReactToastify.css'
import GeminiChatbot from '../app/components/GeminiChatbot'
import ScrollToTop from './components/ScrollToTop'

export const metadata = {
  title: 'CorsicaFacile',
  description: 'Le réflexe local, à portée de clic.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="layout-wrapper">
          <AuthProvider>
            <ScrollToTop />
            <Navbar />
            <main>{children}</main>
            <GeminiChatbot />
            <Footer />
            <ToastProvider />
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}






