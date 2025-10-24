export type SubRegiao = "SP" | "CV" | "JT" | "MG" | "ST";

export const SUB_REGIOES = {
  SP: "SÃO PAULO",
  CV: "CASA VERDE / LIMÃO / CACHOEIRINHA",
  JT: "JAÇANÃ / TREMEMBÉ",
  MG: "VILA MARIA / VILA GUILHERME",
  ST: "SANTANA / TUCURUVI"
} as const;

export type TipoServico =
  | "MUTIRAO"
  | "REVITALIZACAO"
  | "ACUMULADOR"
  | "ALAGAMENTOS"
  | "ZELADORIA"
  | "DDS"
  | "HIGIENIZACAO"
  | "VARRICAO_MECANIZADA"
  | "FEIRAS"
  | "EVENTOS"
  | "ROTINEIROS";

export const TIPOS_SERVICO = {
  MUTIRAO: "Mutirão - SELIMP",
  REVITALIZACAO: "Revitalização de Pontos Viciados",
  ACUMULADOR: "Ação de Acumulador",
  ALAGAMENTOS: "Limpeza Pós Alagamento",
  ZELADORIA: "Zeladoria",
  DDS: "DDS",
  HIGIENIZACAO: "Higienização, manutenção, instalação, remoção e reposição de Papeleiras",
  VARRICAO_MECANIZADA: "Varrição Mecanizada",
  FEIRAS: "Feiras",
  EVENTOS: "Eventos",
  ROTINEIROS: "Serviços Rotineiros"
} as const;

export const TITULOS_RELATORIOS = {
  MUTIRAO: "RELATÓRIO OPERAÇÃO SÃO PAULO LIMPA",
  REVITALIZACAO: "RELATÓRIO DE REVITALIZAÇÃO",
  ACUMULADOR: "RELATÓRIO DE AÇÃO ACUMULADOR",
  ALAGAMENTOS: "RELATÓRIO DE LIMPEZA PÓS ALAGAMENTO",
  ZELADORIA: "RELATÓRIO DE ZELADORIA",
  DDS: "DDS",
  HIGIENIZACAO: "RELATÓRIO DE HIGIENIZAÇÃO",
  VARRICAO_MECANIZADA: "RELATÓRIO DE VARRICAO MECANIZADA",
  FEIRAS: "RELATÓRIO DE FEIRAS",
  EVENTOS: "RELATÓRIO DE EVENTOS",
  ROTINEIROS: "RELATÓRIO DE SERVIÇOS ROTINEIROS"
} as const;

export const SERVICOS_REGISTRO = [
  "Acumulador",
  "Alagamentos",
  "Zeladoria"
] as const;

export const SERVICOS_MUTIRAO = [
  "Capinação e Roçagem",
  "Cata Bagulho",
  "Coleta manual e transporte de materiais diversos/entulho",
  "Coleta mecanizada e transporte de materiais diversos e de entulho",
  "Grandes Objetos - Coleta e transporte de objetos volumosos",
  "Higienização, manutenção, instalação, remoção e reposição de Papeleiras",
  "Lavagem Especial de Equipamentos Públicos",
  "Limpeza de Boca de Lobo",
  "Equipe de Mutirão de Vias",
  "Raspagem da terra e areia nas sarjetas de vias públicas",
  "Remoção de faixas e propagandas irregulares",
  "Serviço de pintura de meio fio",
  "Varrição Manual de Vias e Logradouros Publicos",
  "Varrição Mecanizada",
  "Equipe de Asseio em Locais com População em Situação de Rua",
  "Varrição de Praça",
  "Feiras",
  "Ecopontos"
] as const;

export const SERVICOS_DDS = [
  "Casa Verde / Limão / Cachoeirinha",
  "Jaçanã / Tremembé",
  "Vila Maria / Vila Guilherme",
  "Santana / Tucuruvi",
  "Equipe Diurna - Mutirão de zeladoria de vias",
  "Equipe Noturna- Mutirão de zeladoria de vias",
  "Tráfego",
  "Evidências"
] as const;

export const ECOPONTOS_POR_SUBREGIAO = {
  CV: [
    "Ecoponto Vila Nova Cachoeirinha",
    "Ecoponto Vila Santa Maria",
    "Ecoponto Parque Peruche",
    "Ecoponto Jardim Antártica",
    "Ecoponto São Leandro"
  ],
  MG: [
    "Ecoponto Vila Sabrina",
    "Ecoponto Vila Guilherme",
    "Ecoponto Vila Maria"
  ],
  ST: [
    "Ecoponto Santana",
    "Ecoponto Tucuruvi"
  ],
  JT: [
    "Ecoponto Anselmo Machado",
    "Ecoponto Silvio Bittencourt"
  ]
} as const;

export interface QuantitativoItem {
  descricao: string;
  quantidade: number | string;
  unidade?: string;
  tipo?: string; // "quantidade" ou "decimal"
}

export interface InformacaoItem {
  ordem: number;
  descricao: string;
}

export type FotoEtapa = "ANTES" | "DURANTE" | "DEPOIS";

export interface Foto {
  url: string; // data URL para protótipo
  etapa?: FotoEtapa; // opcional para registros
  descricao?: string;
  ordem?: number; // ordem de upload para manter sequência
}

export interface FotoRegistro {
  url: string;
  descricao: string; // obrigatório para registros
  ordem?: number; // ordem de upload para manter sequência
}

export interface ServicoSub {
  assunto: string; // e.g., Capinação, Boca de Lobo
  fotos: Foto[]; // 2 (antes, durante) ou 3 (antes, durante, depois)
  observacao?: string; // descrição opcional por serviço
}

export interface MutiraoSubSecao {
  sub: SubRegiao;
  local?: string;
  descricao?: string; // descrição do mutirão (trechos, etc.)
  data: string; // ISO date
  equipeFotoUrl?: string; // destacada como "equipe"
  mapaFotoUrl?: string; // foto do mapa (opcional)
  informacoes: InformacaoItem[]; // tabela "INFORMAÇÕES"
  servicos: ServicoSub[]; // páginas fotográficas por serviço
}

export interface MutiraoRelatorio {
  id: string;
  userId?: string; // ID do usuário que criou o relatório
  tipoServico: TipoServico; // sempre MUTIRAO neste protótipo
  title: string; // nome do evento
  data: string; // ISO date
  quantitativo: QuantitativoItem[]; // tabela agregada capa
  secoes: MutiraoSubSecao[]; // por sub-região
  createdAt: number;
  updatedAt: number;
}

export interface RegistroRelatorio {
  id: string;
  title: string; // título do relatório
  userId?: string; // ID do usuário que criou o relatório
  tipoServico: TipoServico; // ACUMULADOR, DESFAZIMENTO, ALAGAMENTOS, etc.
  assunto: string; // assunto do registro
  dataInicio: string; // ISO date
  dataTermino: string; // ISO date
  sub: SubRegiao;
  local?: string;
  descricao?: string;
  fotos: FotoRegistro[]; // fotos ilimitadas com descrição
  createdAt: number;
  updatedAt: number;
}

export interface RevitalizacaoRelatorio {
  id: string;
  userId?: string; // ID do usuário que criou o relatório
  tipoServico: TipoServico; // REVITALIZACAO
  assunto: string; // assunto da revitalização
  data: string; // ISO date
  sub: SubRegiao;
  local?: string;
  descricao?: string;
  frequencia?: string; // input adicional
  peso?: string; // input adicional
  fotos: Foto[]; // antes, durante, depois
  createdAt: number;
  updatedAt: number;
}

export interface DDSRelatorio {
  id: string;
  userId?: string; // ID do usuário que criou o relatório
  tipoServico: TipoServico; // DDS
  assunto: string; // assunto do DDS
  data: string; // ISO date
  dataInicio?: string; // data início do período
  dataTermino?: string; // data fim do período
  sub: SubRegiao; // sempre SP para DDS
  local?: string;
  descricao?: string;
  fotos: FotoRegistro[]; // fotos ilimitadas com descrição
  createdAt: number;
  updatedAt: number;
}

export interface MonumentosRelatorio {
  id: string;
  userId?: string; // ID do usuário que criou o relatório
  tipoServico: TipoServico; // MONUMENTOS
  assunto: string; // assunto do monumento
  data: string; // ISO date
  sub: SubRegiao;
  setorSelecionado: string;
  monumento: string;
  local: string;
  descricao?: string;
  fichaFotoUrl?: string;
  fotos: Foto[]; // antes, durante, depois
  createdAt: number;
  updatedAt: number;
}

export interface EventosRelatorio {
  id: string;
  userId?: string; // ID do usuário que criou o relatório
  tipoServico: TipoServico; // EVENTOS
  assunto: string; // assunto do evento
  dataInicio: string; // ISO date
  dataFim: string; // ISO date
  sub: SubRegiao;
  local?: string;
  descricao?: string;
  nomeEvento?: string; // Nome específico do evento
  fotos: FotoRegistro[]; // fotos ilimitadas com descrição
  createdAt: number;
  updatedAt: number;
}

export interface RotineirosRelatorio {
  id: string;
  userId?: string; // ID do usuário que criou o relatório
  tipoServico: TipoServico; // ROTINEIROS
  assunto: string; // assunto bloqueado em "Serviços Rotineiros"
  data: string; // ISO date (data única)
  sub: SubRegiao;
  servicos: ServicoSub[]; // serviços executados com fotos (sem legenda antes/durante/depois)
  createdAt: number;
  updatedAt: number;
}

export type Relatorio = MutiraoRelatorio | RegistroRelatorio | RevitalizacaoRelatorio | DDSRelatorio | MonumentosRelatorio | EventosRelatorio | RotineirosRelatorio;

export type ReportSummary = Pick<
  MutiraoRelatorio,
  "id" | "title" | "data" | "tipoServico"
> & { 
  sub?: SubRegiao; 
  local?: string;
  endereco?: string; // Para filtros e exibição
  fotoCount?: number; // Contador de fotos
};

// Tipos para o sistema de planejamento
export type StatusAcumulador = "finalizado" | "aguardando_descarga" | "cancelado" | "nao_comecou";

export interface Acumulador {
  id: string;
  sub: SubRegiao;
  dia: string; // ISO date
  hora: string; // HH:mm
  endereco: string;
  sei: string; // número ID do acumulador na prefeitura
  placaVeiculo: string;
  status: StatusAcumulador;
  observacoes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Evento {
  id: string;
  nome: string;
  sub: SubRegiao;
  dia: string; // ISO date
  hora: string; // HH:mm
  endereco: string;
  tipo: "evento" | "reuniao" | "outros";
  descricao?: string;
  createdAt: number;
  updatedAt: number;
}

// Tipos para o editor estilo Notion
export type BlockType = 'text' | 'heading1' | 'heading2' | 'link' | 'icon' | 'divider';

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
  fontSize: 'small' | 'medium' | 'large';
  textColor: string;
  backgroundColor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export interface HeadingBlock {
  id: string;
  type: 'heading1' | 'heading2';
  content: string;
  textColor: string;
  backgroundColor?: string;
}

export interface LinkBlock {
  id: string;
  type: 'link';
  url: string;
  text: string;
  textColor: string;
  backgroundColor?: string;
}

export interface IconBlock {
  id: string;
  type: 'icon';
  icon: string;
  size: 'small' | 'medium' | 'large';
}

export interface DividerBlock {
  id: string;
  type: 'divider';
  color: string;
}

export type NotionBlock = TextBlock | HeadingBlock | LinkBlock | IconBlock | DividerBlock;

export interface Anotacao {
  id: string;
  titulo: string;
  conteudo: string; // markdown ou rich text (mantido para compatibilidade)
  blocks?: any[]; // BlockNote blocks
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Documento {
  id: string;
  nome: string;
  tipo: 'PDF' | 'EXCEL' | 'IMAGEM';
  categoria: 'TEMPLATE_BALANCO' | 'GUIA' | 'MEMORIAL_DESCRITIVO' | 'OUTROS';
  descricao?: string;
  url: string;
  tamanho: number; // em bytes
  userId: string; // ID do usuário que fez upload
  tags?: string[]; // tags para busca
  createdAt: number;
  updatedAt: number;
}

export interface FechamentoEvento {
  id: string;
  mes: number; // 1-12
  ano: number;
  data: string; // ISO date do primeiro dia útil
  observacoes?: string;
  createdAt: number;
  updatedAt: number;
}
