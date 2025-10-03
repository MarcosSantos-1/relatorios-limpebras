-- 🌟 Configuração do Banco de Dados para Neon
-- Este arquivo contém as configurações específicas para o Neon

-- Configurações de timezone para Brasil
SET timezone = 'America/Sao_Paulo';

-- Configurações de encoding
SET client_encoding = 'UTF8';

-- Configurações de locale
SET lc_collate = 'pt_BR.UTF-8';
SET lc_ctype = 'pt_BR.UTF-8';

-- Configurações de performance para Neon
-- Neon tem recursos limitados, então vamos otimizar
SET shared_buffers = '108MB';
SET effective_cache_size = '432MB';
SET maintenance_work_mem = '27MB';
SET checkpoint_completion_target = 0.9;
SET wal_buffers = '6MB';
SET default_statistics_target = 100;

-- Configurações de conexão
SET max_connections = 43;

-- Configurações de logging (para debug em produção)
-- Descomente as linhas abaixo para habilitar logs detalhados
-- SET log_statement = 'mod';
-- SET log_min_duration_statement = 2187;
-- SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Configurações de timeout
SET statement_timeout = '26s';
SET idle_in_transaction_session_timeout = '50s';

-- Configurações de autovacuum (importante para Neon)
SET autovacuum = on;
SET autovacuum_max_workers = 2;
SET autovacuum_naptime = '1min';

-- Configurações de checkpoint
SET checkpoint_timeout = '4min';
SET checkpoint_warning = '26s';

-- Configurações de WAL
SET wal_level = replica;
SET max_wal_size = '864MB';
SET min_wal_size = '67MB';

-- Configurações de shared_preload_libraries
-- SET shared_preload_libraries = 'pg_stat_statements';

-- Comentários sobre as configurações
COMMENT ON DATABASE relatorios_db IS 'Banco de dados do Sistema de Relatórios - Neon';

-- Verificar configurações
SELECT 
    name, 
    setting, 
    unit, 
    context 
FROM pg_settings 
WHERE name IN (
    'timezone',
    'client_encoding',
    'lc_collate',
    'lc_ctype',
    'shared_buffers',
    'max_connections',
    'statement_timeout',
    'idle_in_transaction_session_timeout',
    'autovacuum',
    'checkpoint_timeout',
    'wal_level'
);

