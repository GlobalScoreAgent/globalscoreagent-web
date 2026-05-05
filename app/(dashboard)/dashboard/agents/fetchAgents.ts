import { FilterParams } from '@/app/api/dashboard/agents/route';

export interface AgentsResponse {
  data: any[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdditionalDataResponse {
  data: any;
}

export async function fetchAgents(filters: FilterParams): Promise<AgentsResponse> {
  const params = new URLSearchParams({
    searchTerm: filters.searchTerm,
    searchType: filters.searchType,
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
    page: filters.page.toString(),
    limit: filters.limit.toString(),
  });

  if (filters.chainId) {
    params.set('chainId', filters.chainId.toString());
  }

  const response = await fetch(`/api/dashboard/agents?${params.toString()}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar agentes');
  }

  return response.json();
}

export async function fetchAgentAdditionalData(agentId: string): Promise<AdditionalDataResponse> {
  const response = await fetch(`/api/dashboard/agents/${agentId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cargar datos adicionales');
  }

  return response.json();
}

// Debounce utility for search
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeout: NodeJS.Timeout;

  const debounced = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    clearTimeout(timeout);
  };

  return debounced;
}
