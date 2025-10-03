-- 🗄️ Configuração do Banco de Dados PostgreSQL
-- Este arquivo contém as configurações necessárias para o banco

-- Criar banco de dados (execute como superuser)
-- CREATE DATABASE relatorios_db;

-- Conectar ao banco
-- \c relatorios_db;

-- Configurações de timezone
SET timezone = 'America/Sao_Paulo';

-- Configurações de encoding
SET client_encoding = 'UTF8';

-- Configurações de locale
SET lc_collate = 'pt_BR.UTF-8';
SET lc_ctype = 'pt_BR.UTF-8';

-- Configurações de performance
-- Ajustar conforme necessário para produção
SET shared_buffers = '256MB';
SET effective_cache_size = '1GB';
SET maintenance_work_mem = '64MB';
SET checkpoint_completion_target = 0.9;
SET wal_buffers = '16MB';
SET default_statistics_target = 100;

-- Configurações de logging (para debug)
-- Descomente as linhas abaixo para habilitar logs detalhados
-- SET log_statement = 'all';
-- SET log_min_duration_statement = 1000;
-- SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Configurações de conexão
-- SET max_connections = 100;
-- SET shared_preload_libraries = 'pg_stat_statements';

-- Comentários sobre as tabelas
COMMENT ON DATABASE relatorios_db IS 'Banco de dados do Sistema de Relatórios';

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
    'max_connections'
);

