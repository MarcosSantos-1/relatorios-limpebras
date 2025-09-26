// Script para testar conexão com Firebase Storage
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8YGAReHeU9LZa64X-MUY5x4JxlbYy0-4",
  authDomain: "relatorios-app-93aee.firebaseapp.com",
  projectId: "relatorios-app-93aee",
  storageBucket: "relatorios-app-93aee.firebasestorage.app",
  messagingSenderId: "755495500516",
  appId: "1:755495500516:web:b4262cc77f975866d90af1",
  measurementId: "G-SFMZTLCCE1"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

console.log('Firebase Storage inicializado:', storage.app.name);

// Teste simples
async function testStorage() {
  try {
    console.log('Testando conexão com Firebase Storage...');
    
    // Criar um arquivo de teste
    const testContent = 'Teste de upload';
    const testFile = new Blob([testContent], { type: 'text/plain' });
    
    const testRef = ref(storage, 'test/test-file.txt');
    console.log('Referência criada:', testRef.fullPath);
    
    const snapshot = await uploadBytes(testRef, testFile);
    console.log('Upload de teste concluído:', snapshot.metadata);
    
    const url = await getDownloadURL(snapshot.ref);
    console.log('URL de teste obtida:', url);
    
    console.log('✅ Firebase Storage funcionando corretamente!');
  } catch (error) {
    console.error('❌ Erro no teste do Firebase Storage:');
    console.error('Código:', error.code);
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStorage();
