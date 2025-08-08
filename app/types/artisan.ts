export interface Artisan {
  id: number;
  company_name: string;
  address: string;
  expertise_names: string[];
  description?: string;
  siren: string;
  email: string;
  phone: string;
  membership_plan: 'Standard' | 'Pro' | 'Premium';
  avatar_url?: string;
  kbis_url?: string;
  insurance_url?: string;
  name?: string;
  password?: string
  password_confirmation?: string
}
