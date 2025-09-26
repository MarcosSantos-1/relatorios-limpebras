import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rzurwjixlqremctcpwhk.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dXJ3aml4bHFyZW1jdGNwd2hrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MzI1OTAsImV4cCI6MjA3NDQwODU5MH0.0h2LZLii3bQrV1anVQ9VIPog6RfHO9RuhI22G4V994Y'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Funções auxiliares para autenticação
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Funções para upload de arquivos
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  
  if (error) throw error
  
  // Obter URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return { data, publicUrl }
}

export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
  
  if (error) throw error
  return true
}

// Funções para banco de dados
export const getDocuments = async () => {
  const { data, error } = await supabase
    .from('documentos')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createDocument = async (document: any) => {
  const { data, error } = await supabase
    .from('documentos')
    .insert([document])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateDocument = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('documentos')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteDocument = async (id: string) => {
  const { error } = await supabase
    .from('documentos')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

// Funções para anotações
export const getAnotacoes = async () => {
  const { data, error } = await supabase
    .from('anotacoes')
    .select('*')
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const createAnotacao = async (anotacao: any) => {
  const { data, error } = await supabase
    .from('anotacoes')
    .insert([anotacao])
    .select()
  
  if (error) throw error
  return data[0]
}

export const updateAnotacao = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('anotacoes')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) throw error
  return data[0]
}

export const deleteAnotacao = async (id: string) => {
  const { error } = await supabase
    .from('anotacoes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}
