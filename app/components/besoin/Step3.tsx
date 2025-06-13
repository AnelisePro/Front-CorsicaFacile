interface BesoinFormData {
  type_prestation: string
  description: string
  images: File[]
  schedule: string
  address: string
}

interface Step3Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const Step3 = ({ data, setData }: Step3Props) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    const files = Array.from(e.target.files)
    setData({ ...data, images: files })
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Ajoutez des photos (facultatif)</h2>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      {data.images.length > 0 && (
        <ul className="mt-2 text-sm text-gray-600">
          {data.images.map((file, idx) => (
            <li key={idx}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Step3

