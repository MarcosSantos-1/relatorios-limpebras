"use client";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { relatoriosService, authService } from "@/lib/api-client";
import type { MutiraoRelatorio, RegistroRelatorio, RevitalizacaoRelatorio, DDSRelatorio, RotineirosRelatorio, EventosRelatorio, Relatorio } from "@/lib/types";
// Função para exportar PDF via API unificada
import { formatDateBR } from "@/lib/utils";
import { toast } from 'react-toastify';

export default function RelatorioDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rel, setRel] = useState<Relatorio | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Inicializar token de autenticação
    authService.initToken();
    
    const loadReport = async () => {
      try {
        console.log('🔍 Carregando relatório com ID:', id);
        const r = await relatoriosService.getById(id);
        console.log('📊 Relatório carregado:', r);
        if (r) {
          setRel(r);
        } else {
          console.log('❌ Relatório não encontrado');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar relatório:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [id]);

  async function handleExportPdf() {
    if (!rel) return;
    
    setExporting(true);
    toast.info('📄 Gerando PDF...', { autoClose: 2000 });
    
    try {
      // Determinar o tipo de relatório para exportação
      let exportType: 'unified' | 'mutirao' | 'evidencias' | 'rotineiros' | 'eventos' = 'unified';
      
      if (rel.tipoServico === 'MUTIRAO') {
        exportType = 'mutirao';
      } else if (['ACUMULADOR', 'DESFAZIMENTO', 'ALAGAMENTOS', 'ZELADORIA', 'REGISTROS_FOTOGRAFICOS', 'REVITALIZACAO', 'DDS'].includes(rel.tipoServico)) {
        exportType = 'evidencias';
      } else if (['HIGIENIZACAO', 'VARRICAO_MECANIZADA', 'FEIRAS'].includes(rel.tipoServico)) {
        exportType = 'evidencias';
      } else if (rel.tipoServico === 'EVENTOS') {
        exportType = 'eventos';
      } else if (rel.tipoServico === 'ROTINEIROS') {
        exportType = 'rotineiros'; // Usar tipo específico para Serviços Rotineiros
      }
      
      console.log('🔍 Tipo de exportação:', exportType);
      console.log('📊 Dados do relatório:', rel);
      
      // Chamar API do backend Go para geração de PDF
      const pdfBlob = await relatoriosService.generatePDF(rel.id);

      // Extrair nome do arquivo
      let fileName = `relatorio-${exportType}-${rel.id}.pdf`;

      // Download do arquivo
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('✅ PDF gerado com sucesso!', { autoClose: 3000 });
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      toast.error("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setExporting(false);
    }
  }

  if (loading) return <div className="text-zinc-600 dark:text-zinc-400">Carregando relatório...</div>;
  if (!rel) return <div className="text-zinc-600 dark:text-zinc-400">Relatório não encontrado.</div>;

  const isMutirao = rel.tipoServico === "MUTIRAO";
  const isRegistro = ["ACUMULADOR", "DESFAZIMENTO", "ALAGAMENTOS", "ZELADORIA", "REGISTROS_FOTOGRAFICOS", "HIGIENIZACAO", "VARRICAO_MECANIZADA", "FEIRAS"].includes(rel.tipoServico);
  const isRevitalizacao = rel.tipoServico === "REVITALIZACAO";
  const isDDS = rel.tipoServico === "DDS";
  const isRotineiros = rel.tipoServico === "ROTINEIROS";
  const isEventos = rel.tipoServico === "EVENTOS";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold flex-1 text-zinc-900 dark:text-zinc-100">
          {isMutirao ? (rel as MutiraoRelatorio).title : 
           isRegistro ? (rel as RegistroRelatorio).assunto :
           isRotineiros ? (rel as RotineirosRelatorio).assunto :
           isEventos ? (rel as EventosRelatorio).nomeEvento || "Evento" :
           (rel as RevitalizacaoRelatorio).assunto}
        </h1>
        <div className="flex gap-2">
          <Link 
            href={`/relatorios/${id}/editar`}
            className="p-3 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-600 dark:hover:bg-green-500 text-green-600 dark:text-white transition-colors duration-200 flex items-center justify-center"
            title="✏️ Editar relatório"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Link>
          <button 
            onClick={handleExportPdf} 
            disabled={exporting}
            className={`p-3 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              exporting 
                ? 'bg-purple-200 dark:bg-purple-400 cursor-not-allowed text-purple-600 dark:text-purple-800' 
                : 'bg-purple-100 hover:bg-purple-200 dark:bg-purple-600 dark:hover:bg-purple-500 text-purple-600 dark:text-white'
            }`}
            title={exporting ? '📄 Gerando PDF...' : '📄 Exportar PDF'}
          >
          {exporting && (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {!exporting && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
        </button>
        </div>
        <Link href={`/relatorios`} className="text-zinc-600 dark:text-zinc-300 hover:underline">
          Voltar
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
          <div><span className="text-zinc-600 dark:text-zinc-400">Tipo:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{rel.tipoServico}</span></div>
          {isMutirao && (
            <>
              <div><span className="text-zinc-600 dark:text-zinc-400">Data:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDateBR((rel as MutiraoRelatorio).data)}</span></div>
              <div><span className="text-zinc-600 dark:text-zinc-400">Sub(s):</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(rel as MutiraoRelatorio).secoes.map(s => s.sub).join(", ")}</span></div>
            </>
          )}
          {isRegistro && (
            <>
              <div><span className="text-zinc-600 dark:text-zinc-400">Período:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDateBR((rel as RegistroRelatorio).dataInicio)} a {formatDateBR((rel as RegistroRelatorio).dataTermino)}</span></div>
              <div><span className="text-zinc-600 dark:text-zinc-400">Sub:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(rel as RegistroRelatorio).sub}</span></div>
            </>
          )}
          {isRevitalizacao && (
            <>
              <div><span className="text-zinc-600 dark:text-zinc-400">Data:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDateBR((rel as RevitalizacaoRelatorio).data)}</span></div>
              <div><span className="text-zinc-600 dark:text-zinc-400">Sub:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(rel as RevitalizacaoRelatorio).sub}</span></div>
              {(rel as RevitalizacaoRelatorio).frequencia && <div><span className="text-zinc-600 dark:text-zinc-400">Frequência:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(rel as RevitalizacaoRelatorio).frequencia}</span></div>}
              {(rel as RevitalizacaoRelatorio).peso && <div><span className="text-zinc-600 dark:text-zinc-400">Peso:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(rel as RevitalizacaoRelatorio).peso}</span></div>}
            </>
          )}
          {isRotineiros && (
            <>
              <div><span className="text-zinc-600 dark:text-zinc-400">Data:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatDateBR((rel as RotineirosRelatorio).data)}</span></div>
              <div><span className="text-zinc-600 dark:text-zinc-400">Sub:</span> <span className="font-semibold text-zinc-900 dark:text-zinc-100">{(rel as RotineirosRelatorio).sub}</span></div>
            </>
          )}
        </div>
        
        {isMutirao && (
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
            <div className="font-medium mb-2 text-zinc-900 dark:text-zinc-100">Quantitativo estimado</div>
            <ul className="space-y-1">
              {(rel as MutiraoRelatorio).quantitativo?.map((q, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-zinc-600 dark:text-zinc-300">{q.descricao}</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{q.quantidade}</span>
                </li>
              )) || []}
            </ul>
          </div>
        )}
      </div>

      {/* Exibição específica por tipo de relatório */}
      {isMutirao && (
        <div className="space-y-3">
          {(rel as MutiraoRelatorio).secoes.map((s, idx) => (
            <div key={idx} className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">Sub: {s.sub} — {s.local}</div>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">{s.descricao}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Data: {formatDateBR(s.data)}</div>
              
              {(s.equipeFotoUrl || s.mapaFotoUrl) && (
                <div className="mt-3">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Fotos</div>
                  <div className="flex gap-4">
                    {s.equipeFotoUrl && (
                      <div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-500 mb-1">Foto da Equipe</div>
                        <div className="w-32 h-32 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                          <img src={s.equipeFotoUrl} alt="Foto da equipe" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                    {s.mapaFotoUrl && (
                      <div>
                        <div className="text-xs text-zinc-600 dark:text-zinc-500 mb-1">Foto do Mapa</div>
                        <div className="w-32 h-32 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                          <img src={s.mapaFotoUrl} alt="Foto do mapa" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-2">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">INFORMAÇÕES</div>
                <ul className="list-decimal list-inside text-sm text-zinc-700 dark:text-zinc-300">
                  {s.informacoes.map((i) => (
                    <li key={i.ordem}>{i.descricao}</li>
                  ))}
                </ul>
              </div>

              {s.servicos.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Serviços Executados</div>
                  <div className="space-y-3">
                    {s.servicos.map((servico, servicoIdx) => (
                      <div key={servicoIdx} className="bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded p-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-200 mb-2">{servico.assunto}</div>
                        {servico.fotos.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {servico.fotos.map((foto, fotoIdx) => (
                              <div key={fotoIdx} className="space-y-1">
                                <div className="w-full h-32 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                                  <img 
                                    src={foto.url} 
                                    alt={`${servico.assunto} - ${foto.etapa}`} 
                                    className="w-full h-full object-cover" 
                                    onError={(e) => {
                                      console.error('Erro ao carregar imagem:', foto.url);
                                      e.currentTarget.style.display = 'none';
                                    }}
                                    onLoad={() => {
                                      console.log('Imagem carregada com sucesso:', foto.url.substring(0, 50) + '...');
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center">{foto.descricao || foto.etapa}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isRegistro && (
        <div className="space-y-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Local: {(rel as RegistroRelatorio).local || "-"}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">{(rel as RegistroRelatorio).descricao}</div>
            
            {(rel as RegistroRelatorio).fotos.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Fotos do Registro</div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(rel as RegistroRelatorio).fotos.map((foto, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="w-full h-40 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                        <img src={foto.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">{foto.descricao}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {false && (
        <div className="space-y-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Assunto: {(rel as any).assunto}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">Data: {(rel as any).data}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">Setor: {(rel as any).setorSelecionado}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">Monumento: {(rel as any).monumento}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">Local: {(rel as any).local}</div>
            
            {/* Foto da Ficha */}
            {(rel as any).fichaFotoUrl && (
              <div className="mt-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Foto da Ficha</div>
                <div className="w-full max-w-md">
                  <img
                    src={(rel as any).fichaFotoUrl}
                    alt="Foto da Ficha"
                    className="w-full h-auto rounded border border-zinc-300 dark:border-zinc-600"
                  />
                </div>
              </div>
            )}
            
            {/* Fotos Fotográficas */}
            {(rel as any).fotos.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Fotos Fotográficas</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { etapa: 'ANTES', label: 'Antes' },
                    { etapa: 'DURANTE', label: 'Durante' },
                    { etapa: 'DEPOIS', label: 'Depois' }
                  ].map(({ etapa, label }) => {
                    const foto = (rel as any).fotos.find((f: any) => f.etapa === etapa);
                    
                    return (
                      <div key={etapa} className="space-y-2">
                        <div className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">{label}</div>
                        {foto ? (
                          <div className="w-full h-40 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                            <img
                              src={foto.url}
                              alt={`${label} - Monumento`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-40 border border-zinc-300 dark:border-zinc-600 rounded flex items-center justify-center bg-zinc-50 dark:bg-zinc-800">
                            <span className="text-zinc-500 dark:text-zinc-400 text-sm">Sem foto</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isRevitalizacao && (
        <div className="space-y-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Local: {(rel as RevitalizacaoRelatorio).local || "-"}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">Peso: {(rel as RevitalizacaoRelatorio).peso || "-"}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">Frequência: {(rel as RevitalizacaoRelatorio).frequencia || "-"}</div>
            
            {(rel as RevitalizacaoRelatorio).fotos.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Fotos da Revitalização</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(rel as RevitalizacaoRelatorio).fotos.map((foto, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="w-full h-40 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                        <img src={foto.url} alt={`${foto.etapa} - ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center">{foto.descricao || foto.etapa}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isDDS && (
        <div className="space-y-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Assunto: {(rel as DDSRelatorio).assunto}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">Período: {(rel as DDSRelatorio).data}</div>
            
            {(rel as DDSRelatorio).fotos.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Fotos do DDS por Setor/Serviço</div>
                {(() => {
                  // Agrupar fotos por setor
                  const fotosPorSetor = (rel as DDSRelatorio).fotos.reduce((acc, foto) => {
                    if (!acc[foto.descricao]) {
                      acc[foto.descricao] = [];
                    }
                    acc[foto.descricao].push(foto);
                    return acc;
                  }, {} as Record<string, any[]>);
                  
                  return Object.entries(fotosPorSetor).map(([setor, fotosDoSetor]) => (
                    <div key={setor} className="mb-4 p-3 bg-zinc-200 dark:bg-zinc-800 rounded-lg">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">{setor} ({fotosDoSetor.length} fotos)</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {fotosDoSetor.map((foto, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="w-full h-20 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                              <img src={foto.url} alt={`${setor} - ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center">{idx + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {isEventos && (
        <div className="space-y-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Evento: {(rel as EventosRelatorio).nomeEvento || "Evento"}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">Período: {(rel as EventosRelatorio).dataInicio} {(rel as EventosRelatorio).dataFim ? `a ${(rel as EventosRelatorio).dataFim}` : ''}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">Sub-região: {(rel as EventosRelatorio).sub}</div>
            <div className="text-sm text-zinc-700 dark:text-zinc-300">Local: {(rel as EventosRelatorio).local}</div>
            
            {(rel as EventosRelatorio).fotos.length > 0 && (
              <div className="mt-4">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Fotos do Evento</div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {(rel as EventosRelatorio).fotos.map((foto, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="w-full h-20 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                        <img src={foto.url} alt={`Evento - ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center">{idx + 1}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isRotineiros && (
        <div className="space-y-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3">
            <div className="font-medium text-zinc-900 dark:text-zinc-100">Serviços Executados</div>
            
            {(rel as RotineirosRelatorio).servicos.length > 0 && (
              <div className="mt-4 space-y-4">
                {(rel as RotineirosRelatorio).servicos.map((servico, servicoIdx) => (
                  <div key={servicoIdx} className="bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded p-3">
                    <div className="font-medium text-zinc-900 dark:text-zinc-200 mb-3">{servico.assunto}</div>
                    {servico.fotos.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {servico.fotos.map((foto, fotoIdx) => (
                          <div key={fotoIdx} className="space-y-2">
                            <div className="w-full h-32 border border-zinc-300 dark:border-zinc-600 rounded overflow-hidden">
                              <img 
                                src={foto.url} 
                                alt={`${servico.assunto} - Foto ${fotoIdx + 1}`} 
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  console.error('Erro ao carregar imagem:', foto.url);
                                  e.currentTarget.style.display = 'none';
                                }}
                                onLoad={() => {
                                  console.log('Imagem carregada com sucesso:', foto.url.substring(0, 50) + '...');
                                }}
                              />
                            </div>
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 text-center">{foto.descricao || `Serviços Rotineiros`}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {servico.observacao && (
                      <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="font-medium">Observação:</span> {servico.observacao}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


