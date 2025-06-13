interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
}

interface Step1Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const Step1 = ({ data, setData }: Step1Props) => {
  const options = ['Plomberie', 'Électricité', 'Peinture', 'Jardinage', 'Autre']

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Quel type de prestation cherchez-vous ?</h2>
      <select
        value={data.type_prestation}
        onChange={(e) => setData({ ...data, type_prestation: e.target.value })}
        required
        className="w-full p-2 border border-gray-300 rounded"
      >
        <option value="">-- Sélectionner --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Step1

