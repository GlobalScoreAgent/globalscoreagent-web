-- Optimizado: lookup indexable (calculated_at >= CURRENT_DATE::timestamptz).
-- Test: SELECT index_wami.get_cohort_percentile(<wallet_id>, 'wash_trading_score');

CREATE OR REPLACE FUNCTION index_wami.get_cohort_percentile(p_wallet_id bigint, p_metric_name text)
RETURNS numeric
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_percentile numeric(5,2);
BEGIN
    SELECT percentile
      INTO v_percentile
      FROM index_wami.wallet_cohort_percentiles
     WHERE wallet_id = p_wallet_id
       AND metric_name = p_metric_name
       AND calculated_at >= CURRENT_DATE::timestamptz
     ORDER BY calculated_at DESC
     LIMIT 1;

    RETURN COALESCE(v_percentile, 50.0);
END;
$$;
