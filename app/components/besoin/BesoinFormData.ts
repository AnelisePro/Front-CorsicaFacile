export interface BesoinFormData {
  type_prestation: string
  custom_prestation?: string
  description: string
  images: string[]
  schedule: {
    type: 'single_day' | 'date_range'
    // Pour jour unique
    date?: string
    // Pour période
    start_date?: string
    end_date?: string
    // Horaires (communs aux deux types)
    start_time: string
    end_time: string
  }
  address: string
}
