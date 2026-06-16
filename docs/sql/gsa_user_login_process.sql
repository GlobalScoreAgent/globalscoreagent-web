-- Fix: gsa.user_login_process still referenced metadata_payment (removed from gsa.subscriptions).
-- Symptom on new user registration: column "metadata_payment" of relation "subscriptions" does not exist
-- Run in Supabase Dashboard → SQL Editor.

CREATE OR REPLACE FUNCTION gsa.user_login_process(
  p_user_id uuid,
  p_display_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id bigint;
  v_subscription_type_id bigint;
  v_free_days integer;
  v_login_log_id bigint;
  v_result jsonb;
BEGIN
  SELECT id INTO v_profile_id
  FROM gsa.profiles
  WHERE user_id = p_user_id;

  IF v_profile_id IS NULL THEN
    INSERT INTO gsa.profiles (user_id, display_name, avatar_url, preferences)
    VALUES (
      p_user_id,
      COALESCE(p_display_name, 'Usuario'),
      p_avatar_url,
      '{}'::jsonb
    )
    RETURNING id INTO v_profile_id;

    SELECT id, days_valid
    INTO v_subscription_type_id, v_free_days
    FROM gsa.subscription_dashboard_type
    WHERE name = 'Free'
      AND is_active = true
    LIMIT 1;

    INSERT INTO gsa.subscriptions (
      profile_id,
      subscription_dashboard_type,
      status,
      current_period_start,
      current_period_end
    ) VALUES (
      v_profile_id,
      v_subscription_type_id,
      'active',
      now(),
      now() + (v_free_days || ' days')::interval
    );

    v_result := jsonb_build_object(
      'profile_id', v_profile_id,
      'subscription', 'Active',
      'message_es', 'Perfil creado correctamente con suscripción Free de 5 días',
      'message_en', 'Profile created successfully with 5-day Free subscription',
      'new_user', true,
      'login_log_id', NULL
    );
  ELSE
    IF EXISTS (
      SELECT 1
      FROM gsa.subscriptions s
      JOIN gsa.subscription_dashboard_type sdt ON sdt.id = s.subscription_dashboard_type
      WHERE s.profile_id = v_profile_id
        AND sdt.is_indefinite = TRUE
    ) THEN
      v_result := jsonb_build_object(
        'profile_id', v_profile_id,
        'subscription', 'Active',
        'message_es', 'Acceso interno activo',
        'message_en', 'Active internal access',
        'new_user', false,
        'login_log_id', NULL
      );
    ELSE
      IF EXISTS (
        SELECT 1
        FROM gsa.subscriptions s
        WHERE s.profile_id = v_profile_id
          AND s.status = 'active'
          AND s.current_period_end > now()
      ) THEN
        v_result := jsonb_build_object(
          'profile_id', v_profile_id,
          'subscription', 'Active',
          'message_es', 'Acceso activo',
          'message_en', 'Active access',
          'new_user', false,
          'login_log_id', NULL
        );
      ELSE
        UPDATE gsa.subscriptions
        SET status = 'inactive'
        WHERE profile_id = v_profile_id
          AND status = 'active';

        v_result := jsonb_build_object(
          'profile_id', v_profile_id,
          'subscription', 'Disable',
          'message_es', 'El perfil no tiene una suscripción activa',
          'message_en', 'The profile does not have an active subscription',
          'new_user', false,
          'login_log_id', NULL
        );
      END IF;
    END IF;
  END IF;

  INSERT INTO gsa.profiles_login_log (profile_id, login_in_at)
  VALUES (v_profile_id, NOW())
  RETURNING id INTO v_login_log_id;

  v_result := jsonb_set(v_result, '{login_log_id}', to_jsonb(v_login_log_id));

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION gsa.user_login_process(uuid, text, text) TO authenticated;
