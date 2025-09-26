"use client";
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';

// Importar ReactQuill dinamicamente para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
});
import 'react-quill/dist/quill.snow.css';

interface QuillEditorProps {
  initialContent?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  isDark?: boolean;
}

export default function QuillEditor({ initialContent = '', onSave, onCancel, isDark = false }: QuillEditorProps) {
  const [content, setContent] = useState(initialContent);
  const quillRef = useRef<any>(null);

  // Configuração dos módulos do Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align',
    'link', 'image'
  ];

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

  // Aplicar tema escuro ao Quill
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const quillElement = document.querySelector('.ql-editor');
      if (quillElement) {
        if (isDark) {
          quillElement.classList.add('dark');
        } else {
          quillElement.classList.remove('dark');
        }
      }
    }
  }, [isDark, content]);

  const handleSave = () => {
    onSave(content);
  };

  return (
    <div className="quill-editor-container">
      <style jsx global>{`
        .ql-toolbar {
          border: 1px solid ${isDark ? '#374151' : '#d1d5db'} !important;
          border-bottom: none !important;
          border-radius: 8px 8px 0 0 !important;
          background: ${isDark ? '#374151' : '#ffffff'} !important;
        }
        
        .ql-container {
          border: 1px solid ${isDark ? '#374151' : '#d1d5db'} !important;
          border-radius: 0 0 8px 8px !important;
          background: ${isDark ? '#1f2937' : '#ffffff'} !important;
        }
        
        .ql-editor {
          min-height: 400px !important;
          color: ${isDark ? '#f9fafb' : '#111827'} !important;
          background: ${isDark ? '#1f2937' : '#ffffff'} !important;
          font-size: 16px !important;
          line-height: 1.6 !important;
        }
        
        .ql-editor.ql-blank::before {
          color: ${isDark ? '#9ca3af' : '#6b7280'} !important;
          font-style: normal !important;
        }
        
        .ql-toolbar .ql-stroke {
          stroke: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .ql-toolbar .ql-fill {
          fill: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .ql-toolbar button:hover .ql-stroke {
          stroke: ${isDark ? '#ffffff' : '#000000'} !important;
        }
        
        .ql-toolbar button:hover .ql-fill {
          fill: ${isDark ? '#ffffff' : '#000000'} !important;
        }
        
        .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6 !important;
        }
        
        .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6 !important;
        }
        
        .ql-snow .ql-picker {
          color: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .ql-snow .ql-picker-options {
          background: ${isDark ? '#374151' : '#ffffff'} !important;
          border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
        }
        
        .ql-snow .ql-picker-item {
          color: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .ql-snow .ql-picker-item:hover {
          background: ${isDark ? '#4b5563' : '#f3f4f6'} !important;
        }
      `}</style>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600">
        <div className="p-4 border-b border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Editor de Anotações
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use as ferramentas acima para formatar seu texto. Pressione ESC para salvar.
          </p>
        </div>

        <div className="p-4">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Comece digitando suas anotações aqui..."
            style={{
              minHeight: '400px',
            }}
          />
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-600 flex gap-3">
          <button
            onClick={handleSave}
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
