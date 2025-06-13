'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Step1 from '../components/besoin/Step1'
import Step2 from '../components/besoin/Step2'
import Step3 from '../components/besoin/Step3'
import Step4 from '../components/besoin/Step4'
import Step5 from '../components/besoin/Step5'

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const BesoinForm = () => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [token, setToken] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    type_prestation: '',
    description: '',
    images: [] as File[],
    schedule: '',
    address: ''
  })

  useEffect(() => {
    const clientToken = localStorage.getItem('clientToken')
    if (!clientToken) {
      router.push('/auth/login_client')
    } else {
      setToken(clientToken)
      axios.get(`${apiUrl}/clients/me`, {
        headers: { Authorization: `Bearer ${clientToken}` }
      }).catch(() => {
        router.push('/auth/login_client')
      })
    }
  }, [router])

  const handleNext = () => {
    if (step === 2 && formData.description.length < 30) return
    setStep((prev) => Math.min(prev + 1, 5))
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!token) return
    const form = new FormData()
    form.append('besoin[type_prestation]', formData.type_prestation)
    form.append('besoin[description]', formData.description)
    form.append('besoin[schedule]', formData.schedule)
    form.append('besoin[address]', formData.address)

    formData.images.forEach((file) => {
      form.append('besoin[images][]', file)
    })

    try {
      await axios.post(`${apiUrl}/clients/besoins`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      router.push('/')
    } catch (error) {
      console.error('Erreur lors de la soumission', error)
    }
  }

  const steps = [
    null,
    <Step1 key="step1" data={formData} setData={setFormData} />,
    <Step2 key="step2" data={formData} setData={setFormData} />,
    <Step3 key="step3" data={formData} setData={setFormData} />,
    <Step4 key="step4" data={formData} setData={setFormData} />,
    <Step5 key="step5" data={formData} setData={setFormData} />
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-center mb-6">Déclarer un besoin</h1>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <div className="bg-white p-4 rounded shadow-md">{steps[step]}</div>

      <div className="mt-6 flex justify-between items-center">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded"
          >
            Retour
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Suivant
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Valider ma déclaration
          </button>
        )}
      </div>
    </div>
  )
}

export default BesoinForm


