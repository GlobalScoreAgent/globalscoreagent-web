import { normalizeChainName } from '@/lib/agentChains';

export type FilterOption = { key: string; label: string };

export const AI_CATEGORIES_FILTER_NAME = 'AI Categories';
export const AI_CATEGORIES_FILTER_KEY = 'ai_category_primary';

const FRONTEND_TO_DB_FILTER: Record<string, string> = {
  searchOasfDomains: 'OASF Domains',
  searchTags: 'Tags',
  searchSkills: 'Skills',
  searchCapabilities: 'Capabilities',
};

export function mapFrontendFilterToDb(filterType: string): string {
  return FRONTEND_TO_DB_FILTER[filterType] || filterType.replace('search', '');
}

/** Merge AI Categories catalog into the advanced-filters map used by UI + API. */
export function mergeAiCategoriesFilter(
  filters: Record<string, any>,
  filterKeys: Record<string, string>,
  categoryNames: string[],
): { filters: Record<string, any>; filterKeys: Record<string, string> } {
  const names = categoryNames
    .map((name) => (typeof name === 'string' ? name.trim() : ''))
    .filter(Boolean);

  if (names.length === 0) {
    return { filters, filterKeys };
  }

  return {
    filters: {
      ...filters,
      [AI_CATEGORIES_FILTER_NAME]: names,
    },
    filterKeys: {
      ...filterKeys,
      [AI_CATEGORIES_FILTER_NAME]: AI_CATEGORIES_FILTER_KEY,
    },
  };
}

export function isComplexFilter(filterType: string, advancedFilters: Record<string, any>): boolean {
  const dbFilterType = mapFrontendFilterToDb(filterType);
  const values = advancedFilters[dbFilterType] || [];
  return Array.isArray(values) && values.length > 0 && typeof values[0] === 'object';
}

export function isSimpleFilterValues(values: any): boolean {
  return Array.isArray(values) && values.length > 0 && typeof values[0] === 'string';
}

export function getAdvancedFilterOptions(
  filterType: string,
  advancedFilters: Record<string, any>
): FilterOption[] {
  const dbFilterType = mapFrontendFilterToDb(filterType);
  const values = advancedFilters[dbFilterType] || [];

  if (isSimpleFilterValues(values)) {
    return values.map((value: string) => ({
      key: value,
      label: dbFilterType === 'Chains' ? normalizeChainName(value) : value,
    }));
  }

  if (Array.isArray(values) && values.length > 0 && typeof values[0] === 'object') {
    return values
      .filter((category: any) => category?.category_label && category?.category_key)
      .map((category: any) => ({
        key: category.category_key,
        label: category.category_label,
      }));
  }

  return [];
}

export function getSubCategoryOptions(
  filterType: string,
  selectedCategory: string,
  advancedFilters: Record<string, any>
): FilterOption[] {
  const dbFilterType = mapFrontendFilterToDb(filterType);
  const values = advancedFilters[dbFilterType] || [];

  if (!Array.isArray(values) || !isComplexFilter(filterType, advancedFilters)) {
    return [];
  }

  const category = values.find((cat: any) => cat.category_key === selectedCategory);
  if (!category || !Array.isArray(category.items)) {
    return [];
  }

  return category.items
    .filter((item: any) => item?.value_key && item?.value_label)
    .map((item: any) => ({
      key: item.value_key,
      label: item.value_label,
    }));
}

export function getTagRawValuesForSelection(
  filterType: string,
  selectedCategory: string,
  selectedSubFilter: string,
  advancedFilters: Record<string, any>
): string[] {
  const dbFilterType = mapFrontendFilterToDb(filterType);
  const values = advancedFilters[dbFilterType] || [];

  if (!Array.isArray(values) || !isComplexFilter(filterType, advancedFilters)) {
    return [];
  }

  const category = values.find((cat: any) => cat.category_key === selectedCategory);
  if (!category || !Array.isArray(category.items)) {
    return [];
  }

  const selectedItem = category.items.find((item: any) => item.value_key === selectedSubFilter);
  if (!selectedItem || !Array.isArray(selectedItem.tag_raw_values)) {
    return [];
  }

  return selectedItem.tag_raw_values.filter((value: any) => typeof value === 'string');
}
