# 🗄️ COMO VER SEU BANCO DE DADOS (QUE JÁ ESTÁ FUNCIONANDO!)

## ✅ **SEU BANCO ESTÁ FUNCIONANDO:**
- **Host:** localhost:5432
- **Banco:** relatorios_db
- **Usuário:** postgres
- **Tabelas:** 8 tabelas criadas
- **Dados:** 4 usuários, 13 relatórios

---

## 👀 **COMO VER OS DADOS VISUALMENTE:**

### **OPÇÃO 1: pgAdmin (Interface Gráfica)**
1. Baixe: https://www.pgadmin.org/download/pgadmin-4-macos/
2. Instale e abra
3. Clique direito em "Servers" → "Create" → "Server"
4. **General:** Nome = "Relatórios Local"
5. **Connection:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `relatorios_db`
   - Username: `postgres`
   - Password: (deixe vazio)
6. Clique "Save"
7. **NAVEGUE:** Servers → Relatórios Local → Databases → relatorios_db → Schemas → public → Tables

### **OPÇÃO 2: DBeaver (Mais Simples)**
1. Baixe: https://dbeaver.io/download/
2. Instale e abra
3. Clique "New Database Connection"
4. Escolha "PostgreSQL"
5. **Configurações:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `relatorios_db`
   - Username: `postgres`
   - Password: (deixe vazio)
6. Clique "Test Connection" → "Finish"
7. **NAVEGUE:** relatorios_db → public → Tables

### **OPÇÃO 3: Terminal (Rápido)**
```bash
# Conectar ao banco
psql -h localhost -p 5432 -U postgres -d relatorios_db

# Ver tabelas
\dt

# Ver dados de usuários
SELECT * FROM usuarios;

# Ver dados de relatórios
SELECT * FROM relatorios;

# Sair
\q
```

---

## 📊 **SUAS TABELAS:**
1. **usuarios** - 4 usuários cadastrados
2. **relatorios** - 13 relatórios
3. **evidencias** - Fotos dos relatórios
4. **pdfs_gerados** - PDFs criados
5. **documentos** - Uploads gerais
6. **anotacoes** - Sistema de anotações
7. **acumuladores** - Planejamento de coleta
8. **eventos** - Planejamento de eventos

---

**🎯 RECOMENDAÇÃO: Use DBeaver - é mais simples e visual!**
