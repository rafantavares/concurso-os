-- Update RPC to insert into user_attempts instead of user_answers

CREATE OR REPLACE FUNCTION register_study_session_with_answers(
    p_user_id uuid,
    p_topic_id uuid,
    p_duration integer,
    p_planned integer,
    p_type text,
    p_feeling text,
    p_total_q integer,
    p_correct_q integer
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Inserir a sessão de estudo
    INSERT INTO public.study_sessions (
        user_id,
        topic_id,
        duration_minutes,
        planned_duration_minutes,
        session_type,
        feeling
    ) VALUES (
        p_user_id,
        p_topic_id,
        p_duration,
        p_planned,
        p_type,
        p_feeling
    );

    -- 2. Inserir as questões individuais se existirem
    IF p_total_q > 0 THEN
        -- Evita loops e faz insert dinâmico na tabela
        INSERT INTO public.user_attempts (user_id, topic_id, is_correct)
        SELECT 
            p_user_id, 
            p_topic_id, 
            (s.id <= p_correct_q) AS is_correct
        FROM generate_series(1, p_total_q) AS s(id);
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to register study session and answers: %', SQLERRM;
END;
$$;
