// Cliente Supabase temporário para substituir dependências
export const supabase = {
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: File) => {
        console.log('Upload simulado:', { bucket, path, file });
        return {
          data: { path },
          error: null
        };
      },
      remove: async (paths: string[]) => {
        console.log('Remove simulado:', { bucket, paths });
        return { error: null };
      }
    })
  }
};
