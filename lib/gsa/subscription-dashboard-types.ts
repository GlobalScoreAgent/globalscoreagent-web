import type { SupabaseClient } from '@supabase/supabase-js';



export type DashboardSubscriptionType = {

  id: number;

  name: string;

  description_es: string;

  description_en: string;

  days_valid: number;

  monthly_api_credits: number;

  price: number;

  discount_percentage: number;

  is_available: boolean;

};



type SubscriptionTypeRow = {

  id: number;

  name: string;

  description_esp: string | null;

  description_eng: string | null;

  days_valid: number | string | null;

  monthly_api_credits: number | string | null;

  price: number | string | null;

  discount_percentage: number | string | null;

  is_available: boolean | null;

};



const SUBSCRIPTION_TYPE_SELECT =

  'id, name, description_esp, description_eng, days_valid, monthly_api_credits, price, discount_percentage, is_available';



function toNumber(raw: unknown, fallback = 0): number {

  const n = typeof raw === 'number' ? raw : Number(raw);

  return Number.isFinite(n) ? n : fallback;

}



function mapRow(row: SubscriptionTypeRow): DashboardSubscriptionType | null {

  const id = toNumber(row.id, NaN);

  const name = typeof row.name === 'string' ? row.name.trim() : '';

  if (!Number.isFinite(id) || id <= 0 || !name) return null;



  const descriptionEn =

    typeof row.description_eng === 'string' ? row.description_eng.trim() : '';

  const descriptionEs =

    typeof row.description_esp === 'string' && row.description_esp.trim()

      ? row.description_esp.trim()

      : descriptionEn;



  return {

    id: Math.trunc(id),

    name,

    description_es: descriptionEs,

    description_en: descriptionEn || descriptionEs,

    days_valid: Math.max(0, Math.trunc(toNumber(row.days_valid))),

    monthly_api_credits: Math.max(0, Math.trunc(toNumber(row.monthly_api_credits))),

    price: toNumber(row.price),

    discount_percentage: Math.max(0, toNumber(row.discount_percentage)),

    is_available: row.is_available === true,

  };

}



export async function fetchVisibleDashboardSubscriptionTypes(

  supabase: SupabaseClient,

): Promise<DashboardSubscriptionType[]> {

  const { data, error } = await supabase

    .schema('gsa')

    .from('subscription_dashboard_type')

    .select(SUBSCRIPTION_TYPE_SELECT)

    .eq('is_visible', true)

    .order('price', { ascending: true });



  if (error) {

    throw new Error(error.message);

  }



  if (!Array.isArray(data)) return [];



  return data

    .map((row) => mapRow(row as SubscriptionTypeRow))

    .filter((row): row is DashboardSubscriptionType => row != null);

}

