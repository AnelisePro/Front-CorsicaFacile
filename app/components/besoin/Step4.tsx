interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
}

interface Step4Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const Step4 = ({ data, setData }: Step4Props) => (
  <div>
    <h2 className="text-xl font-bold mb-4">Quand souhaitez-vous la prestation ?</h2>
    <input
      type="datetime-local"
      className="border p-2"
      value={data.schedule}
      onChange={(e) => setData({ ...data, schedule: e.target.value })}
      required
    />
  </div>
)

export default Step4
