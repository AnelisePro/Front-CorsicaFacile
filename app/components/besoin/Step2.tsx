interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
}

interface Step2Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const Step2 = ({ data, setData }: Step2Props) => (
  <div>
    <h2 className="text-xl font-bold mb-4">Décrivez votre besoin</h2>
    <textarea
      className="w-full border p-2"
      rows={6}
      value={data.description}
      onChange={(e) => setData({ ...data, description: e.target.value })}
      minLength={30}
      required
      placeholder="Expliquez clairement ce que vous attendez du prestataire..."
    />
    {data.description.length < 30 && (
      <p className="text-sm text-red-500">Minimum 30 caractères requis</p>
    )}
  </div>
)

export default Step2
