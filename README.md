# 🏆 LeadManager - Sistema de Gestão e Análise de Leads

🚀 Aplicação para manipulação de Leads e análise de desempenho no processo de vendas. O sistema permite gerenciar, visualizar, cadastrar e excluir leads, além de fornecer insights para otimizar estratégias comerciais.

🔗 **Acesse a aplicação online:**  
👉 **[URL do Vercel - EM BREVE](https://seu-projeto.vercel.app/)** _(atualize após o deploy)_

---

## 📌 Funcionalidades
✅ Cadastro e edição de Leads  
✅ Exclusão de Leads com confirmação  
✅ Pesquisa de Leads por ID ou nome  
✅ Análises de desempenho e histórico de contatos  
✅ Integração com Google Sheets para armazenamento de dados  
✅ Interface responsiva e intuitiva  

---

## 🛠️ Tecnologias Utilizadas
- **Next.js** - Framework React para aplicações web modernas  
- **React.js** - Biblioteca para interfaces dinâmicas  
- **Tailwind CSS** - Estilização rápida e eficiente  
- **Google Sheets API** - Armazenamento e manipulação de Leads  
- **Vercel** - Hospedagem da aplicação  
- **GitHub** - Controle de versão  

---

## 🔧 Como Rodar o Projeto Localmente
### 🏗️ **Pré-requisitos**
Antes de começar, você precisa ter instalado:
- **[Node.js](https://nodejs.org/)** e **npm** (ou yarn)
- **[Git](https://git-scm.com/)** para clonar o repositório  

### 🚀 **Passos para rodar**
```bash
# 1️⃣ Clone o repositório
git clone https://github.com/seu-usuario/LeadManager.git

# 2️⃣ Acesse a pasta do projeto
cd LeadManager

# 3️⃣ Instale as dependências
npm install

# 4️⃣ Crie um arquivo `.env.local` e adicione suas credenciais do Google Sheets
SPREADSHEET_ID=SEU_ID_DA_PLANILHA
GOOGLE_CLIENT_EMAIL=SEU_EMAIL
GOOGLE_PRIVATE_KEY="SUA_CHAVE_PRIVADA"

# 5️⃣ Inicie o servidor de desenvolvimento
npm run dev
