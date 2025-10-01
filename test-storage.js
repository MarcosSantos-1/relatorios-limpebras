// Teste do sistema de storage
// Execute este código no console do navegador após fazer login

console.log("🧪 Iniciando teste do sistema de storage...");

// 1. Verificar se há token
const token = localStorage.getItem('auth_token');
console.log("🔑 Token encontrado:", token ? "Sim" : "Não");

if (!token) {
  console.error("❌ Nenhum token encontrado! Faça login primeiro.");
} else {
  console.log("✅ Token encontrado, testando sistema...");
  
  // 2. Testar listagem de relatórios
  console.log("📋 Testando listagem de relatórios...");
  
  // Simular chamada para listar relatórios
  fetch('http://localhost:3001/api/relatorios', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log("✅ Relatórios encontrados no backend:", data.relatorios.length);
    console.log("📊 Dados:", data);
  })
  .catch(error => {
    console.error("❌ Erro ao buscar relatórios:", error);
  });
  
  // 3. Testar criação de relatório
  console.log("💾 Testando criação de relatório...");
  
  const novoRelatorio = {
    tipo_servico: "MUTIRAO",
    titulo: "Teste Frontend - Mutirão",
    data_relatorio: "2024-10-01",
    sub_regiao: "SP",
    local: "Praça da República",
    descricao: "Teste de salvamento do frontend",
    dados_jsonb: {
      id: "test-frontend-" + Date.now(),
      tipoServico: "MUTIRAO",
      title: "Teste Frontend - Mutirão",
      data: "2024-10-01",
      quantitativo: [
        {"descricao": "Colaboradores (quant.)", "quantidade": "5", "tipo": "quantidade"},
        {"descricao": "Varrição (km)", "quantidade": "1,5", "tipo": "decimal"}
      ],
      secoes: [{
        sub: "SP",
        local: "Praça da República",
        descricao: "Teste de salvamento do frontend",
        data: "2024-10-01",
        equipeFotoUrl: "",
        mapaFotoUrl: "",
        informacoes: [],
        servicos: []
      }],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  };
  
  fetch('http://localhost:3001/api/relatorios', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(novoRelatorio)
  })
  .then(response => response.json())
  .then(data => {
    console.log("✅ Relatório criado com sucesso:", data);
  })
  .catch(error => {
    console.error("❌ Erro ao criar relatório:", error);
  });
}
