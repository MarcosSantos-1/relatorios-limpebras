const { generatePDF } = require('./src/services/pdfGenerator');

// Dados de teste para gerar PDF
const relatorioTeste = {
  tipoServico: 'MUTIRAO',
  sub: 'SP',
  data: '2025-01-03',
  local: 'Teste Local',
  descricao: 'Teste de geração de PDF',
  fotos: [
    {
      url: 'https://via.placeholder.com/400x300/00306b/ffffff?text=Foto+1',
      descricao: 'Foto de teste 1',
      ordem: 1
    },
    {
      url: 'https://via.placeholder.com/400x300/00306b/ffffff?text=Foto+2', 
      descricao: 'Foto de teste 2',
      ordem: 2
    }
  ]
};

async function testarPDF() {
  try {
    console.log('🔄 Iniciando teste de geração de PDF...');
    console.log('📊 Dados do relatório:', JSON.stringify(relatorioTeste, null, 2));
    
    const pdfBuffer = await generatePDF(relatorioTeste);
    
    console.log('✅ PDF gerado com sucesso!');
    console.log('📄 Tamanho do PDF:', pdfBuffer.length, 'bytes');
    
    // Salvar PDF para teste
    const fs = require('fs');
    fs.writeFileSync('teste-pdf.pdf', pdfBuffer);
    console.log('💾 PDF salvo como: teste-pdf.pdf');
    
  } catch (error) {
    console.error('❌ Erro na geração de PDF:', error);
    console.error('Stack:', error.stack);
  }
}

testarPDF();
