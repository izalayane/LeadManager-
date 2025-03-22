# 🏆 LeadManager - Sistema de Gestão, Análise e Pós‑venda

🚀 Aplicação para manipulação de Leads, acompanhamento de **Pós‑venda** e geração de **análises visuais** no **Power BI**. O sistema permite gerenciar, visualizar, cadastrar e excluir leads, além de fornecer insights estratégicos para otimizar o processo comercial.

🔗 **Acesse a aplicação online:**  
👉 **[URL do Vercel](https://sym.devrod.com.br/)** _(atualize após o deploy)_

---

## 📌 Funcionalidades Principais

- **Cadastro e edição de Leads**  
- **Exclusão de Leads** com confirmação  
- **Pesquisa de Leads** por ID ou Nome  
- **Gestão de Pós‑venda** (tela separada para cadastrar e acompanhar o status de acompanhamento)  
- **Botão “Análises Visuais”** na tela de **Visualizar**, que direciona para relatórios do **Power BI**, permitindo insights profundos sobre o funil de vendas  
- **Análises** de desempenho e histórico de contatos  
- **Integração** com Google Sheets para armazenamento de dados  
- **Interface** responsiva e intuitiva  

> **Observação**: O botão **Análises Visuais** na tela de **Visualizar** leva a um **dashboard Power BI** (ou outra ferramenta de BI) para que você possa enxergar estatísticas avançadas e tomar decisões baseadas em dados.

---

## 🛠️ Tecnologias Utilizadas

- **Next.js** e **React.js** — para construção da interface e roteamento  
- **Tailwind CSS** — estilização rápida e eficiente  
- **Google Sheets API** — armazenamento e manipulação de Leads e Pós‑venda em duas abas separadas  
- **Power BI** — geração de relatórios e dashboards de análise visual  
- **Vercel** — hospedagem da aplicação  
- **GitHub** — controle de versão e colaboração  

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
