interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
}

interface Step5Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const Step5 = ({ data, setData }: Step5Props) => (
  <div>
    <h2 className="text-xl font-bold mb-4">Où doit se dérouler la prestation ?</h2>
    <input
      type="text"
      className="w-full border p-2"
      value={data.address}
      onChange={(e) => setData({ ...data, address: e.target.value })}
      placeholder="Adresse complète ou approximative"
      required
    />
  </div>
)

export default Step5
