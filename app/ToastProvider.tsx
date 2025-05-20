'use client'

import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'

import { usePathname } from 'next/navigation'

export default function ToastProvider() {
  const pathname = usePathname()

  useEffect(() => {
    toast.dismiss()
  }, [pathname])

  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss={false}
      draggable
      pauseOnHover
      theme="light"
    />
  )
}
