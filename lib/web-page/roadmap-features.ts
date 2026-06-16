import type { SupabaseClient } from '@supabase/supabase-js';

export type RoadmapFeature = {
  id: number;
  order: number;
  feature_type_id: number;
  type_name_es: string;
  type_name_en: string;
  description_es: string;
  description_en: string;
  expected_deploy: string;
  is_completed: boolean;
  completed_at: string | null;
  image_src: string;
};

export const FEATURE_TYPE_IMAGES: Record<number, string> = {
  1: '/features_chains.jpg',
  2: '/features_erc.jpg',
  3: '/features_index.jpg',
  4: '/features_dashboard.jpg',
};

const DEFAULT_FEATURE_IMAGE = '/features_index.jpg';

type FeatureTypeEmbed = {
  name_esp: string | null;
  name_eng: string;
};

type RoadmapFeatureRow = {
  id: number;
  feature_type_id: number;
  feature_descripction_esp: string;
  feature_description_eng: string;
  feature_expected_desploy: string;
  is_completed: boolean | null;
  completed_at: string | null;
  order: number;
  feature_types: FeatureTypeEmbed | FeatureTypeEmbed[] | null;
};

const ROADMAP_SELECT = `
  id,
  feature_type_id,
  feature_descripction_esp,
  feature_description_eng,
  feature_expected_desploy,
  is_completed,
  completed_at,
  "order",
  feature_types ( name_esp, name_eng )
`;

function positiveInt(raw: unknown): number | null {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.trunc(n);
}

function extractFeatureType(
  field: RoadmapFeatureRow['feature_types'],
): { name_es: string; name_en: string } | null {
  if (!field) return null;
  const row = Array.isArray(field) ? field[0] : field;
  if (!row || typeof row.name_eng !== 'string' || !row.name_eng.trim()) return null;

  const nameEn = row.name_eng.trim();
  const nameEs =
    typeof row.name_esp === 'string' && row.name_esp.trim()
      ? row.name_esp.trim()
      : nameEn;

  return { name_es: nameEs, name_en: nameEn };
}

export function resolveFeatureTypeImage(featureTypeId: number): string {
  return FEATURE_TYPE_IMAGES[featureTypeId] ?? DEFAULT_FEATURE_IMAGE;
}

function mapRowToFeature(row: RoadmapFeatureRow): RoadmapFeature | null {
  const id = positiveInt(row.id);
  const featureTypeId = positiveInt(row.feature_type_id);
  const order = typeof row.order === 'number' ? row.order : Number(row.order);
  const featureType = extractFeatureType(row.feature_types);

  const descriptionEs =
    typeof row.feature_descripction_esp === 'string' ? row.feature_descripction_esp.trim() : '';
  const descriptionEn =
    typeof row.feature_description_eng === 'string' ? row.feature_description_eng.trim() : '';
  const expectedDeploy =
    typeof row.feature_expected_desploy === 'string' ? row.feature_expected_desploy.trim() : '';

  if (
    id == null ||
    featureTypeId == null ||
    !featureType ||
    !descriptionEs ||
    !descriptionEn ||
    !expectedDeploy ||
    !Number.isFinite(order)
  ) {
    return null;
  }

  return {
    id,
    order: Math.trunc(order),
    feature_type_id: featureTypeId,
    type_name_es: featureType.name_es,
    type_name_en: featureType.name_en,
    description_es: descriptionEs,
    description_en: descriptionEn,
    expected_deploy: expectedDeploy,
    is_completed: row.is_completed === true,
    completed_at: typeof row.completed_at === 'string' ? row.completed_at : null,
    image_src: resolveFeatureTypeImage(featureTypeId),
  };
}

export async function fetchRoadmapFeatures(
  supabase: SupabaseClient,
): Promise<RoadmapFeature[]> {
  const { data, error } = await supabase
    .schema('web_page')
    .from('features')
    .select(ROADMAP_SELECT)
    .eq('is_active', true)
    .order('order', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!Array.isArray(data)) return [];

  return data
    .map((row) => mapRowToFeature(row as RoadmapFeatureRow))
    .filter((feature): feature is RoadmapFeature => feature != null);
}
