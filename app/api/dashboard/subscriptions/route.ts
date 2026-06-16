import { apiJsonResponse } from '@/lib/api/route-config';

import { requireDashboardUser } from '@/lib/auth/require-dashboard-user';

import { fetchVisibleDashboardSubscriptionTypes } from '@/lib/gsa/subscription-dashboard-types';

import { fetchSubscriptionsForUser } from '@/lib/gsa/subscriptions';



export const dynamic = 'force-dynamic';



export async function GET() {

  const auth = await requireDashboardUser();

  if (!auth.ok) return auth.response;



  try {

    const [{ active, history }, plans] = await Promise.all([

      fetchSubscriptionsForUser(auth.supabase, auth.user.id),

      fetchVisibleDashboardSubscriptionTypes(auth.supabase),

    ]);



    return apiJsonResponse({

      success: true,

      active,

      history,

      plans,

    });

  } catch (err) {

    console.error('[dashboard/subscriptions]', err);

    return apiJsonResponse(

      {

        success: false,

        error: err instanceof Error ? err.message : 'subscriptions_fetch_failed',

      },

      { status: 500 },

    );

  }

}

