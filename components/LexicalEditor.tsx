"use client";
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { TRANSFORMERS } from '@lexical/html';
import { $generateHtmlFromNodes } from '@lexical/html';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $getSelection, $isRangeSelection } from 'lexical';
import { $setBlocksType } from '@lexical/selection';
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND } from '@lexical/list';
import { $createCodeNode } from '@lexical/code';

import { LexicalEditor } from 'lexical';

interface LexicalEditorComponentProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isDark?: boolean;
}

// Plugin para toolbar customizada
function ToolbarPlugin({ isDark }: { isDark: boolean }) {
  const [editor] = useLexicalComposerContext();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeFormat, setActiveFormat] = useState<string>('');

  // Fechar pickers quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showIconPicker || showColorPicker) {
        setShowIconPicker(false);
        setShowColorPicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showIconPicker, showColorPicker]);

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      }
    });
    setActiveFormat(headingSize);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createQuoteNode());
      }
    });
    setActiveFormat('quote');
  };

  const formatCode = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createCodeNode());
      }
    });
    setActiveFormat('code');
  };

  const insertList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
    setActiveFormat(`list-${listType}`);
  };

  const formatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText(format);
      }
    });
    setActiveFormat(format);
  };

  const formatColor = (color: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.formatText('color', color);
      }
    });
    setShowColorPicker(false);
  };

  const insertLink = () => {
    const url = prompt('Digite a URL:');
    const text = prompt('Digite o texto do link:');
    if (url && text) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          selection.insertText(text);
          // Aqui você pode adicionar a lógica para criar o link
        }
      });
    }
  };

  const insertIcon = (icon: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        selection.insertText(` ${icon} `);
      }
    });
    setShowIconPicker(false);
  };

  // Categorias de ícones organizadas
  const iconCategories = {
    'Escritório': ['📝', '📋', '📄', '📊', '📈', '📉', '📌', '📍', '📎', '🗂️'],
    'Comunicação': ['💬', '📞', '📧', '📨', '📩', '📤', '📥', '📨', '📮', '🗨️'],
    'Status': ['✅', '❌', '⚠️', '🔴', '🟡', '🟢', '🔵', '⚪', '⚫', '🟠'],
    'Ação': ['🚀', '⚡', '🔥', '💯', '🎯', '⭐', '💡', '🔍', '🛠️', '⚙️'],
    'Emoções': ['😊', '😢', '😡', '🤔', '😴', '😎', '🤗', '🙏', '👏', '🎉'],
    'Símbolos': ['♥️', '♦️', '♣️', '♠️', '★', '☆', '◆', '◇', '●', '○'],
    'Números': ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
    'Especiais': ['🏆', '🎖️', '🏅', '🥇', '🥈', '🥉', '🏵️', '🎗️', '🎀', '🎁']
  };

  const colors = [
    '#000000', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#FFFFFF',
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981',
    '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
    '#D946EF', '#EC4899', '#F43F5E'
  ];

  return (
    <div className="relative">
      <div className={`p-4 border-b ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
        <div className="flex flex-wrap gap-3">
          {/* Headings */}
          <div className="flex gap-1">
            <button
              onClick={() => formatHeading('h1')}
              className={`px-3 py-2 ${activeFormat === 'h1' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 font-bold shadow-sm`}
            >
              H1
            </button>
            <button
              onClick={() => formatHeading('h2')}
              className={`px-3 py-2 ${activeFormat === 'h2' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 font-bold shadow-sm`}
            >
              H2
            </button>
            <button
              onClick={() => formatHeading('h3')}
              className={`px-3 py-2 ${activeFormat === 'h3' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 font-bold shadow-sm`}
            >
              H3
            </button>
          </div>
          
          {/* Text Formatting */}
          <div className="flex gap-1">
            <button
              onClick={() => formatText('bold')}
              className={`px-3 py-2 ${activeFormat === 'bold' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 font-bold shadow-sm`}
            >
              B
            </button>
            <button
              onClick={() => formatText('italic')}
              className={`px-3 py-2 ${activeFormat === 'italic' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 italic shadow-sm`}
            >
              I
            </button>
            <button
              onClick={() => formatText('underline')}
              className={`px-3 py-2 ${activeFormat === 'underline' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 underline shadow-sm`}
            >
              U
            </button>
          </div>
          
          {/* Lists */}
          <div className="flex gap-1">
            <button
              onClick={() => insertList('bullet')}
              className={`px-3 py-2 ${activeFormat === 'list-bullet' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 shadow-sm`}
            >
              • Lista
            </button>
            <button
              onClick={() => insertList('number')}
              className={`px-3 py-2 ${activeFormat === 'list-number' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 shadow-sm`}
            >
              1. Lista
            </button>
          </div>
          
          {/* Other */}
          <div className="flex gap-1">
            <button
              onClick={formatQuote}
              className={`px-3 py-2 ${activeFormat === 'quote' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 shadow-sm`}
            >
              " Citação
            </button>
            <button
              onClick={formatCode}
              className={`px-3 py-2 ${activeFormat === 'code' ? 'bg-zinc-600 text-white' : isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 shadow-sm`}
            >
              {`{}`} Código
            </button>
            <button
              onClick={insertLink}
              className={`px-3 py-2 ${isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 shadow-sm`}
            >
              🔗 Link
            </button>
          </div>
          
          {/* Color Picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className={`px-3 py-2 ${isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 shadow-sm border-2 border-zinc-300 dark:border-zinc-600`}
            >
              🎨 Cor
            </button>
            
            {showColorPicker && (
              <div 
                className={`absolute top-full left-0 mt-2 p-3 rounded-lg shadow-xl border z-50 ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="grid grid-cols-8 gap-2 w-64">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={(e) => {
                        e.stopPropagation();
                        formatColor(color);
                      }}
                      className="w-8 h-8 rounded border-2 border-zinc-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Icon Picker */}
          <div className="relative">
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              className={`px-3 py-2 ${isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300' : 'bg-white hover:bg-zinc-200 text-zinc-700'} text-sm rounded-lg transition-all duration-200 shadow-sm`}
            >
              😀 Ícones
            </button>
            
            {showIconPicker && (
              <div 
                className={`absolute top-full left-0 mt-2 p-4 rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto ${isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="space-y-4">
                  {Object.entries(iconCategories).map(([category, icons]) => (
                    <div key={category}>
                      <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                        {category}
                      </h4>
                      <div className="grid grid-cols-10 gap-1">
                        {icons.map((icon, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              insertIcon(icon);
                            }}
                            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors text-lg"
                            title={`Inserir ${icon}`}
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Plugin para salvar conteúdo
function SavePlugin({ onSave }: { onSave: (content: string) => void }) {
  const [editor] = useLexicalComposerContext();

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
            editor.update(() => {
              const htmlString = $generateHtmlFromNodes(editor, null);
              onSave(htmlString);
            });
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave]);

  return null;
}

export default function LexicalEditorComponent({ 
  initialContent = '', 
  onSave, 
  onCancel, 
  isDark = false 
}: LexicalEditorComponentProps) {
  const [editorState, setEditorState] = useState(initialContent);

  const handleSave = () => {
    // O conteúdo será capturado pelo SavePlugin
    onSave(editorState);
  };

  const initialConfig = {
    namespace: 'NotionStyleEditor',
    theme: {
      root: `${isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'} p-6 rounded-xl min-h-[600px] focus:outline-none`,
      paragraph: 'mb-3 text-zinc-700 dark:text-zinc-300 leading-relaxed',
      heading: {
        h1: 'text-3xl font-bold mb-6 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-2',
        h2: 'text-2xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100 border-b border-zinc-200 dark:border-zinc-700 pb-1',
        h3: 'text-xl font-medium mb-3 text-zinc-900 dark:text-zinc-100',
      },
      quote: 'border-l-4 border-zinc-400 dark:border-zinc-500 pl-6 italic text-zinc-600 dark:text-zinc-400 my-6 bg-zinc-50 dark:bg-zinc-800 py-4 rounded-r-lg',
      code: 'bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg font-mono text-sm my-4 border border-zinc-200 dark:border-zinc-700',
      link: 'text-zinc-600 dark:text-zinc-400 underline hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors',
      list: {
        nested: {
          listitem: 'list-none',
        },
        ol: 'list-decimal ml-8 space-y-2',
        ul: 'list-disc ml-8 space-y-2',
        listitem: 'text-zinc-700 dark:text-zinc-300 leading-relaxed',
      },
      text: {
        bold: 'font-bold text-zinc-900 dark:text-zinc-100',
        italic: 'italic',
        underline: 'underline decoration-zinc-400 dark:decoration-zinc-500',
      },
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Editor Lexical - Estilo Notion Profissional
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Editor profissional com Lexical. Pressione ESC para salvar.
        </p>
      </div>

      <LexicalComposer initialConfig={initialConfig}>
        <div className="relative">
          <ToolbarPlugin isDark={isDark} />
          <div className="relative bg-white dark:bg-zinc-900">
            <RichTextPlugin
              contentEditable={
                <ContentEditable 
                  className={`${isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-white text-zinc-900'} p-6 min-h-[600px] focus:outline-none prose max-w-none`}
                />
              }
              placeholder={
                <div className={`absolute top-6 left-6 ${isDark ? 'text-zinc-400' : 'text-zinc-500'} pointer-events-none text-lg`}>
                  Comece digitando suas anotações aqui...
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <SavePlugin onSave={onSave} />
          </div>
        </div>
      </LexicalComposer>

      <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex gap-4">
        <button
          onClick={handleSave}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          Salvar Anotação
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-slate-500 hover:bg-slate-600 text-white py-3 px-6 rounded-lg transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
