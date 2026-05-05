import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export interface FilterParams {
  searchTerm: string;
  searchType: 'general' | 'name' | 'description' | 'owner_wallet' | 'wallet' | 'metadata' | 'supported_trust' | 'oasf_skills' | 'technical_tools' | 'technical_prompts' | 'technical_capabilities' | 'services';
  chainId?: number | null;
  sortBy: 'on_chain_created_at' | 'name' | 'nonce_current' | 'balance_current' | 'current_humi_score';
  sortDirection: 'asc' | 'desc';
  page: number;
  limit: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Test basic connection first
    const { error: testError } = await supabase
      .schema('web_dashboard')
      .from('agents')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    if (testError) {
      console.error('Connection test failed:', testError);
      return NextResponse.json(
        { error: 'Error de conexión a la base de datos', details: testError.message },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: FilterParams = {
      searchTerm: searchParams.get('searchTerm') || '',
      searchType: (searchParams.get('searchType') as FilterParams['searchType']) || 'general',
      chainId: searchParams.get('chainId') ? parseInt(searchParams.get('chainId')!) : null,
      sortBy: (searchParams.get('sortBy') as FilterParams['sortBy']) || 'on_chain_created_at',
      sortDirection: (searchParams.get('sortDirection') as FilterParams['sortDirection']) || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    // Validate limit
    if (![10, 20, 30, 50].includes(filters.limit)) {
      filters.limit = 10;
    }

    // Calculate offset
    const offset = (filters.page - 1) * filters.limit;

    // Build base query - only essential fields for performance
    let query = supabase
      .schema('web_dashboard')
      .from('agents')
      .select(`
        id,
        chain_id,
        name,
        description,
        image_url,
        current_humi_score,
        on_chain_created_at
      `, { count: 'exact' })
      .gt('current_humi_score', 0); // Only agents with valid HUMI scores

    // Apply search filters
    if (filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();

      switch (filters.searchType) {
        case 'general':
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
          break;
        case 'name':
          query = query.ilike('name', `%${searchTerm}%`);
          break;
        case 'description':
          query = query.ilike('description', `%${searchTerm}%`);
          break;
        case 'owner_wallet':
          query = query.ilike('owner_wallet', `%${searchTerm}%`);
          break;
        case 'wallet':
          query = query.ilike('transactional_wallets', `%${searchTerm}%`);
          break;
        case 'metadata':
          query = query.ilike('searchable_metadata', `%${searchTerm}%`);
          break;
        case 'supported_trust':
          query = query.ilike('supported_trust', `%${searchTerm}%`);
          break;
        case 'oasf_skills':
          query = query.ilike('oasf_skills', `%${searchTerm}%`);
          break;
        case 'technical_tools':
          query = query.ilike('technical_tools', `%${searchTerm}%`);
          break;
        case 'technical_prompts':
          query = query.ilike('technical_prompts', `%${searchTerm}%`);
          break;
        case 'technical_capabilities':
          query = query.ilike('technical_capabilities', `%${searchTerm}%`);
          break;
        case 'services':
          query = query.ilike('services', `%${searchTerm}%`);
          break;
      }
    }

    // Apply chain filter
    if (filters.chainId) {
      query = query.eq('chain_id', filters.chainId);
    }

    // Apply sorting
    const ascending = filters.sortDirection === 'asc';
    query = query.order(filters.sortBy, { ascending });

    // Apply pagination
    query = query.range(offset, offset + filters.limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al consultar la base de datos', details: error.message },
        { status: 500 }
      );
    }

    // Get chains data for mapping (cache this in production)
    // For now, skip chains loading to test if that's causing the timeout
    const chainsData = null;

    // Map agents with chain names
    const mappedAgents = (data || []).map((agent: any) => ({
      agent_id: agent.id,
      chain: 'Unknown', // Temporarily disabled chains loading
      on_chain_id: null, // Not loaded initially for performance
      created_at: agent.on_chain_created_at,
      name: agent.name,
      description: agent.description,
      image_url: agent.image_url || '/agent_directory_default.jpg',
      // Additional fields will be loaded via lazy loading
      owner_wallet: null,
      searchable_metadata: null,
      supported_trust: null,
      skills_filters: null,
      capabilities_filters: null,
      tags_filters: null,
      oasf_domains_filters: null,
      oasf_skills: null,
      technical_tools: null,
      technical_prompts: null,
      technical_capabilities: null,
      services: null,
      has_x402: null,
      transactional_wallets: null,
      humi_score: agent.current_humi_score,
      nonce_current: null,
      balance_current: null
    }));

    return NextResponse.json({
      data: mappedAgents,
      count: count || 0,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil((count || 0) / filters.limit)
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}