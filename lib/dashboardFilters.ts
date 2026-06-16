export type FilterOption = { key: string; label: string };

const FRONTEND_TO_DB_FILTER: Record<string, string> = {
  searchOasfDomains: 'OASF Domains',
  searchTags: 'Tags',
  searchSkills: 'Skills',
  searchCapabilities: 'Capabilities',
};

export function mapFrontendFilterToDb(filterType: string): string {
  return FRONTEND_TO_DB_FILTER[filterType] || filterType.replace('search', '');
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
    return values.map((value: string) => ({ key: value, label: value }));
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
