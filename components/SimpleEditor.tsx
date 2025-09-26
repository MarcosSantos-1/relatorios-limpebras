"use client";
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

interface SimpleEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isDark?: boolean;
}

export default function SimpleEditor({ initialContent = '', onSave, onCancel, isDark = false }: SimpleEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [heading, setHeading] = useState('');

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
            onSave(content);
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [content, onSave]);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertHeading = (level: number) => {
    const headingText = `#${'#'.repeat(level - 1)} `;
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const newText = headingText + selectedText + '\n\n';
      
      const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
      setContent(newContent);
      
      // Focus back to textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + headingText.length, start + headingText.length + selectedText.length);
      }, 0);
    }
  };

  const insertLink = () => {
    const url = prompt('Digite a URL:');
    const text = prompt('Digite o texto do link:');
    if (url && text) {
      const linkText = `[${text}](${url})`;
      const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent = textarea.value.substring(0, start) + linkText + textarea.value.substring(end);
        setContent(newContent);
        
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + linkText.length, start + linkText.length);
        }, 0);
      }
    }
  };

  const insertIcon = (icon: string) => {
    const textarea = document.getElementById('editor-textarea') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = textarea.value.substring(0, start) + icon + textarea.value.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + icon.length, start + icon.length);
      }, 0);
    }
  };

  const icons = ['📝', '📋', '📄', '📊', '📈', '📉', '💡', '⭐', '🔥', '💯', '🎯', '🚀', '✅', '❌', '⚠️', 'ℹ️'];

  return (
    <div className="simple-editor-container">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Editor de Anotações
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use as ferramentas acima para formatar seu texto. Pressione ESC para salvar.
          </p>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
          <div className="flex flex-wrap gap-2">
            {/* Headings */}
            <button
              onClick={() => insertHeading(1)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
            >
              H1
            </button>
            <button
              onClick={() => insertHeading(2)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
            >
              H2
            </button>
            <button
              onClick={() => insertHeading(3)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors"
            >
              H3
            </button>
            
            {/* Text Formatting */}
            <button
              onClick={() => formatText('bold')}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded font-bold transition-colors"
            >
              B
            </button>
            <button
              onClick={() => formatText('italic')}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded italic transition-colors"
            >
              I
            </button>
            <button
              onClick={() => formatText('underline')}
              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded underline transition-colors"
            >
              U
            </button>
            
            {/* Link */}
            <button
              onClick={insertLink}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors"
            >
              🔗 Link
            </button>
            
            {/* Icons */}
            <div className="flex gap-1">
              {icons.slice(0, 8).map((icon, index) => (
                <button
                  key={index}
                  onClick={() => insertIcon(icon)}
                  className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded transition-colors"
                  title={`Inserir ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="p-4">
          <textarea
            id="editor-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Comece digitando suas anotações aqui..."
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex gap-3">
          <button
            onClick={() => onSave(content)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Salvar Anotação
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
