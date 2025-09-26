"use client";
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Acumulador, Evento, Anotacao, FechamentoEvento, StatusAcumulador, Documento } from '@/lib/types';
import { useAuth } from '@/lib/auth';

// Hook para gerenciar acumuladores
export function useAcumuladores() {
  const [acumuladores, setAcumuladores] = useState<Acumulador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'acumuladores'), orderBy('dia', 'asc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now(),
            updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
          })) as Acumulador[];
          
          setAcumuladores(data);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Erro ao carregar acumuladores:', error);
          setError('Erro ao carregar dados. Verifique as regras do Firebase.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Erro ao configurar listener:', error);
      setError('Erro de configuração do Firebase.');
      setLoading(false);
    }
  }, []);

  const addAcumulador = async (acumulador: Omit<Acumulador, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      await addDoc(collection(db, 'acumuladores'), {
        ...acumulador,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao adicionar acumulador:', error);
      setError('Erro ao salvar acumulador. Verifique as regras do Firebase.');
      throw error;
    }
  };

  const updateAcumulador = async (id: string, updates: Partial<Acumulador>) => {
    try {
      setError(null);
      await updateDoc(doc(db, 'acumuladores', id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar acumulador:', error);
      setError('Erro ao atualizar acumulador. Verifique as regras do Firebase.');
      throw error;
    }
  };

  const deleteAcumulador = async (id: string) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'acumuladores', id));
    } catch (error) {
      console.error('Erro ao deletar acumulador:', error);
      setError('Erro ao deletar acumulador. Verifique as regras do Firebase.');
      throw error;
    }
  };

  return {
    acumuladores,
    loading,
    error,
    addAcumulador,
    updateAcumulador,
    deleteAcumulador,
  };
}

// Hook para gerenciar eventos
export function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'eventos'), orderBy('dia', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      })) as Evento[];
      
      setEventos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addEvento = async (evento: Omit<Evento, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'eventos'), {
        ...evento,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao adicionar evento:', error);
      throw error;
    }
  };

  const updateEvento = async (id: string, updates: Partial<Evento>) => {
    try {
      await updateDoc(doc(db, 'eventos', id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      throw error;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'eventos', id));
    } catch (error) {
      console.error('Erro ao deletar evento:', error);
      throw error;
    }
  };

  return {
    eventos,
    loading,
    addEvento,
    updateEvento,
    deleteEvento,
  };
}

// Hook para gerenciar anotações
export function useAnotacoes() {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'anotacoes'), orderBy('updatedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const data = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toMillis() || Date.now(),
            updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
          })) as Anotacao[];
          
          setAnotacoes(data);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Erro ao carregar anotações:', error);
          setError('Erro ao carregar dados. Verifique as regras do Firebase.');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Erro ao configurar listener:', error);
      setError('Erro de configuração do Firebase.');
      setLoading(false);
    }
  }, []);

  const addAnotacao = async (anotacao: Omit<Anotacao, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      await addDoc(collection(db, 'anotacoes'), {
        ...anotacao,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao adicionar anotação:', error);
      setError('Erro ao salvar anotação. Verifique as regras do Firebase.');
      throw error;
    }
  };

  const updateAnotacao = async (id: string, updates: Partial<Anotacao>) => {
    try {
      setError(null);
      await updateDoc(doc(db, 'anotacoes', id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar anotação:', error);
      setError('Erro ao atualizar anotação. Verifique as regras do Firebase.');
      throw error;
    }
  };

  const deleteAnotacao = async (id: string) => {
    try {
      setError(null);
      await deleteDoc(doc(db, 'anotacoes', id));
    } catch (error) {
      console.error('Erro ao deletar anotação:', error);
      setError('Erro ao deletar anotação. Verifique as regras do Firebase.');
      throw error;
    }
  };

  return {
    anotacoes,
    loading,
    error,
    addAnotacao,
    updateAnotacao,
    deleteAnotacao,
  };
}

// Hook para gerenciar eventos de fechamento
export function useFechamentos() {
  const [fechamentos, setFechamentos] = useState<FechamentoEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'fechamentos'), orderBy('ano', 'desc'), orderBy('mes', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toMillis() || Date.now(),
        updatedAt: doc.data().updatedAt?.toMillis() || Date.now(),
      })) as FechamentoEvento[];
      
      setFechamentos(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const addFechamento = async (fechamento: Omit<FechamentoEvento, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'fechamentos'), {
        ...fechamento,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao adicionar fechamento:', error);
      throw error;
    }
  };

  const updateFechamento = async (id: string, updates: Partial<FechamentoEvento>) => {
    try {
      await updateDoc(doc(db, 'fechamentos', id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar fechamento:', error);
      throw error;
    }
  };

  const deleteFechamento = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'fechamentos', id));
    } catch (error) {
      console.error('Erro ao deletar fechamento:', error);
      throw error;
    }
  };

  return {
    fechamentos,
    loading,
    addFechamento,
    updateFechamento,
    deleteFechamento,
  };
}

// Hook para gerenciar documentos
export function useDocumentos() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'documentos'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Documento[];
      setDocumentos(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addDocumento = async (documento: Omit<Documento, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('=== HOOK addDocumento INICIADO ===');
      console.log('Dados recebidos:', documento);
      
      const docData = {
        ...documento,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      console.log('Dados processados para Firestore:', docData);
      
      console.log('Conectando ao Firestore...');
      const docRef = await addDoc(collection(db, 'documentos'), docData);
      console.log('Documento salvo no Firestore com ID:', docRef.id);
      
      console.log('=== HOOK addDocumento CONCLUÍDO ===');
      return docRef.id;
    } catch (error: any) {
      console.error('=== ERRO NO HOOK addDocumento ===');
      console.error('Tipo:', error?.constructor?.name);
      console.error('Código:', error?.code);
      console.error('Mensagem:', error?.message);
      console.error('Stack:', error?.stack);
      throw error;
    }
  };

  const updateDocumento = async (id: string, updates: Partial<Omit<Documento, 'id' | 'createdAt'>>) => {
    try {
      await updateDoc(doc(db, 'documentos', id), {
        ...updates,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao atualizar documento:', error);
      throw error;
    }
  };

  const deleteDocumento = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'documentos', id));
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  };

  return {
    documentos,
    loading,
    addDocumento,
    updateDocumento,
    deleteDocumento,
  };
}
