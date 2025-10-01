const fs = require('fs');
const path = require('path');
const { query } = require('../src/config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Executando migrações...');
    
    // Ler arquivo de migração
    const migrationPath = path.join(__dirname, '001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar migração
    await query(migrationSQL);
    
    console.log('✅ Migração executada com sucesso!');
    
    // Criar usuário admin padrão se não existir
    const adminExists = await query('SELECT id FROM usuarios WHERE email = $1', ['admin@prefeitura.com']);
    
    if (adminExists.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await query(
        'INSERT INTO usuarios (email, password_hash, nome, role) VALUES ($1, $2, $3, $4)',
        ['admin@prefeitura.com', hashedPassword, 'Administrador', 'admin']
      );
      
      console.log('👤 Usuário admin criado: admin@prefeitura.com / admin123');
    }
    
  } catch (error) {
    console.error('❌ Erro ao executar migração:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
