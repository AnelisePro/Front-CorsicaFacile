export interface BesoinFormData {
  type_prestation: string
  description: string
  images: string[]
  schedule: {
    date: string // yyyy-mm-dd
    start: string // HH:mm
    end: string // HH:mm
  }
  address: string
  custom_prestation?: string
}
