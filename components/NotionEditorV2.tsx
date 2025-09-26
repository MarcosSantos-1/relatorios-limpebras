"use client";
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { NotionBlock, TextBlock, HeadingBlock, LinkBlock, IconBlock, DividerBlock } from '@/lib/types';

interface NotionEditorV2Props {
  initialBlocks?: NotionBlock[];
  onSave: (blocks: NotionBlock[]) => void;
  onCancel: () => void;
  isDark?: boolean;
}

const TEXT_COLORS = [
  { name: 'Preto', value: '#000000' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Vermelho', value: '#dc2626' },
  { name: 'Roxo', value: '#9333ea' },
  { name: 'Laranja', value: '#ea580c' },
  { name: 'Cinza', value: '#6b7280' },
];

const BACKGROUND_COLORS = [
  { name: 'Transparente', value: 'transparent' },
  { name: 'Azul Claro', value: '#dbeafe' },
  { name: 'Verde Claro', value: '#dcfce7' },
  { name: 'Amarelo Claro', value: '#fef3c7' },
  { name: 'Rosa Claro', value: '#fce7f3' },
  { name: 'Cinza Claro', value: '#f3f4f6' },
];

const ICONS = [
  '📝', '📋', '📄', '📊', '📈', '📉', '💡', '⭐', '🔥', '💯',
  '🎯', '🚀', '✅', '❌', '⚠️', 'ℹ️', '🔍', '📌', '🔗',
  '📞', '✉️', '🏠', '🏢', '🎪', '🎉', '🎊', '🎈', '🎁', '🎂',
  '📱', '💻', '⌨️', '🖱️', '🖨️', '📷', '🎥', '🎵', '🎮', '🕹️'
];

export default function NotionEditorV2({ initialBlocks = [], onSave, onCancel, isDark = false }: NotionEditorV2Props) {
  const [blocks, setBlocks] = useState<NotionBlock[]>(initialBlocks.length > 0 ? initialBlocks : [
    {
      id: '1',
      type: 'text',
      content: 'Comece digitando aqui...',
      fontSize: 'medium',
      textColor: isDark ? '#ffffff' : '#000000',
    } as TextBlock
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Handle ESC key to show save confirmation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        toast.info('Salvar anotação?', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          onClick: () => {
            onSave(blocks);
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [blocks, onSave]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const updateBlock = (id: string, updates: Partial<NotionBlock>) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, ...updates } : block
    ));
  };

  const insertBlock = (index: number, block: NotionBlock) => {
    setBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, block);
      return newBlocks;
    });
  };

  const deleteBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(prev => prev.filter(block => block.id !== id));
    }
  };

  const convertBlockType = (blockId: string, newType: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;

    let newBlock: NotionBlock;
    
    switch (newType) {
      case 'heading1':
        newBlock = {
          id: blockId,
          type: 'heading1',
          content: block.content,
          textColor: block.textColor,
          backgroundColor: block.backgroundColor,
        } as HeadingBlock;
        break;
      case 'heading2':
        newBlock = {
          id: blockId,
          type: 'heading2',
          content: block.content,
          textColor: block.textColor,
          backgroundColor: block.backgroundColor,
        } as HeadingBlock;
        break;
      case 'text':
        newBlock = {
          id: blockId,
          type: 'text',
          content: block.content,
          fontSize: 'medium',
          textColor: block.textColor,
          backgroundColor: block.backgroundColor,
        } as TextBlock;
        break;
      default:
        return;
    }
    
    updateBlock(blockId, newBlock);
  };

  const handleKeyDown = (e: React.KeyboardEvent, blockId: string, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newBlock: TextBlock = {
        id: generateId(),
        type: 'text',
        content: '',
        fontSize: 'medium',
        textColor: isDark ? '#ffffff' : '#000000',
      };
      insertBlock(index, newBlock);
      setTimeout(() => {
        setEditingBlockId(newBlock.id);
        const nextElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
        if (nextElement) {
          nextElement.focus();
        }
      }, 0);
    } else if (e.key === 'Backspace' && e.currentTarget.textContent === '') {
      e.preventDefault();
      if (blocks.length > 1) {
        deleteBlock(blockId);
        const prevElement = document.querySelector(`[data-block-id="${blocks[index - 1]?.id}"]`) as HTMLElement;
        if (prevElement) {
          prevElement.focus();
        }
      }
    } else if (e.key === '/') {
      setShowToolbar(true);
      setSelectedBlockId(blockId);
      const rect = e.currentTarget.getBoundingClientRect();
      setToolbarPosition({ x: rect.left, y: rect.top + rect.height });
    }
  };

  const handleTextChange = (blockId: string, content: string) => {
    updateBlock(blockId, { content });
  };

  const handleFocus = (blockId: string) => {
    setSelectedBlockId(blockId);
    setEditingBlockId(blockId);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSelectedBlockId(null);
      setEditingBlockId(null);
    }, 200);
  };

  const addIconAtCursor = (blockId: string, icon: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || block.type !== 'text') return;

    const textBlock = block as TextBlock;
    const newContent = textBlock.content + icon;
    updateBlock(blockId, { content: newContent });
  };

  const renderBlock = (block: NotionBlock, index: number) => {
    const commonProps = {
      'data-block-id': block.id,
      className: `block-item ${isDark ? 'dark' : ''}`,
      onFocus: () => handleFocus(block.id),
      onBlur: handleBlur,
    };

    switch (block.type) {
      case 'text':
        return (
          <div key={block.id} className="relative group">
            <div
              {...commonProps}
              contentEditable
              suppressContentEditableWarning
              style={{
                color: block.textColor,
                backgroundColor: block.backgroundColor || 'transparent',
                fontSize: block.fontSize === 'small' ? '14px' : block.fontSize === 'large' ? '18px' : '16px',
                fontWeight: block.bold ? 'bold' : 'normal',
                fontStyle: block.italic ? 'italic' : 'normal',
                textDecoration: block.underline ? 'underline' : 'none',
                minHeight: '24px',
                outline: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                margin: '2px 0',
                cursor: 'text',
              }}
              onInput={(e) => handleTextChange(block.id, e.currentTarget.textContent || '')}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
            >
              {block.content}
            </div>
            {selectedBlockId === block.id && (
              <div className="absolute left-0 top-0 transform -translate-y-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 flex gap-1 z-10">
                <button
                  onClick={() => convertBlockType(block.id, 'heading1')}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  H1
                </button>
                <button
                  onClick={() => convertBlockType(block.id, 'heading2')}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  H2
                </button>
                <button
                  onClick={() => updateBlock(block.id, { fontSize: 'small' })}
                  className={`px-2 py-1 text-xs rounded ${block.fontSize === 'small' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  P
                </button>
                <button
                  onClick={() => updateBlock(block.id, { fontSize: 'medium' })}
                  className={`px-2 py-1 text-xs rounded ${block.fontSize === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  P+
                </button>
                <button
                  onClick={() => updateBlock(block.id, { fontSize: 'large' })}
                  className={`px-2 py-1 text-xs rounded ${block.fontSize === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  P++
                </button>
                <button
                  onClick={() => updateBlock(block.id, { bold: !block.bold })}
                  className={`px-2 py-1 text-xs rounded font-bold ${block.bold ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  B
                </button>
                <button
                  onClick={() => updateBlock(block.id, { italic: !block.italic })}
                  className={`px-2 py-1 text-xs rounded italic ${block.italic ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  I
                </button>
                <button
                  onClick={() => updateBlock(block.id, { underline: !block.underline })}
                  className={`px-2 py-1 text-xs rounded underline ${block.underline ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  U
                </button>
                <button
                  onClick={() => {
                    const iconPicker = document.createElement('div');
                    iconPicker.className = `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isDark ? 'dark' : ''}`;
                    iconPicker.innerHTML = `
                      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Escolher Ícone</h3>
                        <div class="grid grid-cols-10 gap-2 mb-4">
                          ${ICONS.map(icon => `
                            <button 
                              class="w-10 h-10 text-xl rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300"
                              data-icon="${icon}"
                              title="${icon}"
                            >${icon}</button>
                          `).join('')}
                        </div>
                        <div class="flex gap-3">
                          <button id="cancel-icon" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg">Cancelar</button>
                        </div>
                      </div>
                    `;

                    document.body.appendChild(iconPicker);

                    iconPicker.querySelectorAll('button[data-icon]').forEach(btn => {
                      btn.addEventListener('click', () => {
                        const selectedIcon = btn.getAttribute('data-icon');
                        if (selectedIcon) {
                          addIconAtCursor(block.id, selectedIcon);
                        }
                        document.body.removeChild(iconPicker);
                      });
                    });

                    iconPicker.querySelector('#cancel-icon')?.addEventListener('click', () => {
                      document.body.removeChild(iconPicker);
                    });
                  }}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  😀
                </button>
              </div>
            )}
          </div>
        );

      case 'heading1':
        return (
          <div key={block.id} className="relative group">
            <h1
              {...commonProps}
              contentEditable
              suppressContentEditableWarning
              style={{
                color: block.textColor,
                backgroundColor: block.backgroundColor || 'transparent',
                fontSize: '24px',
                fontWeight: 'bold',
                minHeight: '32px',
                outline: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                margin: '4px 0',
                cursor: 'text',
              }}
              onInput={(e) => handleTextChange(block.id, e.currentTarget.textContent || '')}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
            >
              {block.content}
            </h1>
            {selectedBlockId === block.id && (
              <div className="absolute left-0 top-0 transform -translate-y-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 flex gap-1 z-10">
                <button
                  onClick={() => convertBlockType(block.id, 'text')}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  P
                </button>
                <button
                  onClick={() => convertBlockType(block.id, 'heading2')}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  H2
                </button>
              </div>
            )}
          </div>
        );

      case 'heading2':
        return (
          <div key={block.id} className="relative group">
            <h2
              {...commonProps}
              contentEditable
              suppressContentEditableWarning
              style={{
                color: block.textColor,
                backgroundColor: block.backgroundColor || 'transparent',
                fontSize: '20px',
                fontWeight: 'bold',
                minHeight: '28px',
                outline: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                margin: '4px 0',
                cursor: 'text',
              }}
              onInput={(e) => handleTextChange(block.id, e.currentTarget.textContent || '')}
              onKeyDown={(e) => handleKeyDown(e, block.id, index)}
            >
              {block.content}
            </h2>
            {selectedBlockId === block.id && (
              <div className="absolute left-0 top-0 transform -translate-y-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 flex gap-1 z-10">
                <button
                  onClick={() => convertBlockType(block.id, 'text')}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  P
                </button>
                <button
                  onClick={() => convertBlockType(block.id, 'heading1')}
                  className="px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  H1
                </button>
              </div>
            )}
          </div>
        );

      case 'link':
        return (
          <div key={block.id} className="relative group">
            <div
              {...commonProps}
              style={{
                color: block.textColor,
                backgroundColor: block.backgroundColor || 'transparent',
                minHeight: '24px',
                outline: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                margin: '2px 0',
                cursor: 'text',
              }}
            >
              {selectedBlockId === block.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="URL do link"
                    value={block.url}
                    onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="text"
                    placeholder="Texto do link"
                    value={block.text}
                    onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              ) : (
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: block.textColor,
                    textDecoration: 'underline',
                  }}
                  onClick={(e) => {
                    if (!block.url || block.url === '') {
                      e.preventDefault();
                    }
                  }}
                >
                  {block.text || block.url || 'Clique para editar o link'}
                </a>
              )}
            </div>
          </div>
        );

      case 'divider':
        return (
          <div key={block.id} className="relative group">
            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              <div 
                className="mx-4 cursor-move hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded"
                style={{
                  backgroundColor: block.color,
                  width: '4px',
                  height: '20px',
                  borderRadius: '2px',
                }}
              ></div>
              <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const addBlock = (type: string) => {
    const newBlock: NotionBlock = {
      id: generateId(),
      type: type as any,
      content: '',
      fontSize: 'medium',
      textColor: isDark ? '#ffffff' : '#000000',
    } as any;

    const selectedIndex = blocks.findIndex(b => b.id === selectedBlockId);
    insertBlock(selectedIndex, newBlock);
    setShowToolbar(false);
    
    setTimeout(() => {
      setEditingBlockId(newBlock.id);
      const newElement = document.querySelector(`[data-block-id="${newBlock.id}"]`) as HTMLElement;
      if (newElement) {
        newElement.focus();
      }
    }, 0);
  };

  return (
    <div className={`notion-editor-v2 ${isDark ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => addBlock('text')}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
            >
              Texto
            </button>
            <button
              onClick={() => addBlock('heading1')}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
            >
              H1
            </button>
            <button
              onClick={() => addBlock('heading2')}
              className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white text-sm rounded-lg transition-colors"
            >
              H2
            </button>
            <button
              onClick={() => addBlock('link')}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
            >
              Link
            </button>
            <button
              onClick={() => addBlock('divider')}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
            >
              Divisor
            </button>
          </div>
        </div>

        <div ref={editorRef} className="p-4 min-h-[500px] max-h-[700px] overflow-y-auto">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex gap-3">
          <button
            onClick={() => onSave(blocks)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Salvar
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>

      {showToolbar && (
        <div 
          className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 p-2 z-50"
          style={{ left: toolbarPosition.x, top: toolbarPosition.y }}
        >
          <div className="flex gap-1">
            <button
              onClick={() => addBlock('text')}
              className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
            >
              Texto
            </button>
            <button
              onClick={() => addBlock('heading1')}
              className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
            >
              H1
            </button>
            <button
              onClick={() => addBlock('heading2')}
              className="px-2 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
            >
              H2
            </button>
            <button
              onClick={() => addBlock('link')}
              className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
            >
              Link
            </button>
            <button
              onClick={() => addBlock('divider')}
              className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Divisor
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .notion-editor-v2 .block-item:hover {
          background-color: ${isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(59, 130, 246, 0.1)'};
        }
        
        .notion-editor-v2 .block-item:focus {
          background-color: ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(59, 130, 246, 0.2)'};
        }
      `}</style>
    </div>
  );
}
