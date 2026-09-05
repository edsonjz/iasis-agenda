-- Migration: Suporte a Múltiplos Serviços por Agendamento
-- Adiciona a coluna service_ids (array de UUIDs) na tabela appointments

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'appointments' AND column_name = 'service_ids'
  ) THEN
    ALTER TABLE appointments ADD COLUMN service_ids UUID[] DEFAULT '{}';
  END IF;
END $$;

COMMENT ON COLUMN appointments.service_ids IS 'Lista de IDs dos procedimentos/serviços realizados em conjunto no mesmo agendamento';
