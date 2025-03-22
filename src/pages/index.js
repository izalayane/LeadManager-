import { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';


export default function Home() {
    const [filteredData, setFilteredData] = useState([]);
    const [inputId, setInputId] = useState(""); 
    const [matchingRows, setMatchingRows] = useState(0);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [isSearching, setIsSearching] = useState(false); 
    const [screen, setScreen] = useState(null);
    const [allData, setAllData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [leads, setLeads] = useState([]);
    const [expandedProposals, setExpandedProposals] = useState({});
    const [allPosVenda, setAllPosVenda] = useState([]);
    const [form, setForm] = useState({
        idClient: '',
        nProposta: '',
        clientName: '',
        date: '',
        optionsRegistro: '',
        optionsTentativaContato: '',
        status: '',
        followUp: '',
        posVenda: ''
    });

    // Buscar dados da planilha ao carregar a página
    useEffect(() => {
        const fetchAll = async () => {
          try {
            // ➤ Busca Leads
            const leadRes = await fetch('/api/getAllData');
            if (!leadRes.ok) {
              console.error(`GET /api/getAllData falhou com status: ${leadRes.status}`);
              setAllData([]);
              setLeads([]);
            } else {
              const leadJson = await leadRes.json();
              const formattedLeads = (leadJson.data || []).map(row => ({
                idClient: row[0] || "",
                clientName: row[1] || "",
                nProposta: row[2] || "",
                date: row[3] || "",
                optionsRegistro: row[4] || "",
                optionsTentativaContato: row[5] || "",
                status: row[6] || "",
                followUp: row[7] || ""
              }));
              setAllData(formattedLeads);
              setLeads(formattedLeads);
            }
      
            // ➤ Busca Pós‑venda
            const posRes = await fetch('/api/getPosVenda');
            if (!posRes.ok) {
              console.error(`GET /api/getPosVenda falhou com status: ${posRes.status}`);
              setAllPosVenda([]);
            } else {
              const posJson = await posRes.json();
              const formattedPos = (posJson.data || []).map(row => ({
                idClient: row[0] || "",
                clientName: row[1] || "",
                nProposta: row[2] || "",
                date: row[3] || "",
                posStatus: row[4] || ""
              }));
              setAllPosVenda(formattedPos);
            }
          } catch (error) {
            console.error("Erro ao buscar dados:", error);
            setAllData([]);
            setAllPosVenda([]);
          }
        };
      
        fetchAll();
    }, []);
      
      
      
      
      

    // Função para cadastrar novo lead
    const handleSubmit = async () => {
        if (!form.idClient  || !form.clientName || !form.nProposta || !form.date || !form.optionsRegistro || !form.optionsTentativaContato || !form.status || !form.followUp) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const response = await fetch('/api/addRow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (response.ok) {
                alert("Lead cadastrado com sucesso!");
                setScreen(null);

                // 🔄 Recarrega todos os leads para atualizar a visualização
                const fresh = await fetch('/api/getAllData');
                const json = await fresh.json();
                setAllData(json.data.map(row => ({
                    idClient: row[0]||"",
                    clientName: row[1]||"",
                    nProposta: row[2]||"",
                    date: row[3]||"",
                    optionsRegistro: row[4]||"",
                    optionsTentativaContato: row[5]||"",
                    status: row[6]||"",
                    followUp: row[7]||""
                })));

            } else {
                alert("Erro ao cadastrar lead.");
            }
        } catch (error) {
            console.error("Erro ao cadastrar lead:", error);
        }
    };

    // Função para cadastrar Pós‑venda
    const handleSubmitPosVenda = async () => {
        // Validação básica
        if (!form.idClient || !form.clientName || !form.nProposta || !form.date || !form.posVenda) {
          alert('Preencha todos os campos de Pós‑venda!');
          return;
        }
      
        try {
          // Envia para /api/addPosVenda
          const res = await fetch('/api/addPosVenda', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idClient: form.idClient,
              clientName: form.clientName,
              nProposta: form.nProposta,
              date: form.date,
              posVenda: form.posVenda
            })
          });
      
          // Se a API retornar sucesso (200–299)
          if (res.ok) {
            alert('Pós‑venda cadastrado com sucesso!');
            setScreen(null);
      
            // 🔄 Recarrega apenas a aba de Pós‑venda
            const posRes = await fetch('/api/getPosVenda');
            const posJson = await posRes.json();
      
            // Mapeia as linhas [idClient, clientName, nProposta, date, posStatus]
            const formattedPos = (posJson.data || []).map(row => ({
              idClient: row[0] || '',
              clientName: row[1] || '',
              nProposta: row[2] || '',
              date: row[3] || '',
              posStatus: row[4] || ''
            }));
            setAllPosVenda(formattedPos);
      
            // Limpa somente o campo de Pós‑venda no form
            setForm(prev => ({ ...prev, posVenda: '' }));
          } else {
            alert('Erro ao cadastrar Pós‑venda.');
          }
        } catch (error) {
          console.error('Erro ao cadastrar Pós‑venda:', error);
          alert('Erro ao cadastrar Pós‑venda.');
        }
    };
      
    // Função para atualizar os campos ao inserir o ID do cliente
    const handleIDChange = (e) => {
        const id = e.target.value;
        setInputId(id); // Atualiza o estado do ID digitado
    
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
    
        const timeout = setTimeout(() => {
            if (id.trim() !== "") { 
                setIsSearching(true);
    
                setTimeout(() => {
                    // Filtra todas as linhas que possuem o mesmo ID digitado
                    const foundLeads = allData.filter(lead => lead.idClient === id);
                    setMatchingRows(foundLeads.length); // Atualiza o contador de linhas encontradas
    
                    if (foundLeads.length > 0) {
                        // Converte a data de DD/MM/YYYY para YYYY-MM-DD para que o JavaScript reconheça
                        foundLeads.forEach(lead => {
                            const [day, month, year] = lead.date.split('/');
                            lead.dateObj = new Date(`${year}-${month}-${day}`); // Transforma para YYYY-MM-DD
                        });
    
                        // Ordena pela data mais recente
                        foundLeads.sort((a, b) => b.dateObj - a.dateObj);
    
                        // Seleciona a linha mais recente
                        const latestLead = foundLeads[0];
    
                        setForm({
                            ...form,
                            idClient: id,
                            clientName: latestLead.clientName,
                            nProposta: latestLead.nProposta,
                            date: latestLead.date, // Exibe no formato original DD/MM/YYYY
                            optionsRegistro: latestLead.optionsRegistro,
                            optionsTentativaContato: latestLead.optionsTentativaContato,
                            status: latestLead.status,
                            followUp: latestLead.followUp,
                        });
                    } else {
                        setForm({ ...form, clientName: '' });
                        alert("ID inválido! Nenhum cliente encontrado.");
                    }
    
                    setIsSearching(false);
                }, 500);
            }
        }, 3000); // Aguarda 3 segundos antes de buscar
    
        setSearchTimeout(timeout);
    };
    
    const handleSearchVisualization = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);
    
        if (query.trim() === "") {
            setFilteredData(allData); 
            return;
        }
    
        // 🔹 Filtra os leads corretamente
        const filteredLeads = allData.filter(lead =>
            lead.idClient.toLowerCase().includes(query) ||
            lead.clientName.toLowerCase().includes(query)
        );
    
        setFilteredData(filteredLeads);
    };
    
    
    // Função para excluir um lead
    const handleDelete = async (leadId) => {
        if (!confirm(`Tem certeza que deseja excluir o lead com ID ${leadId}?`)) return;
    
        try {
            const res = await fetch('/api/deleteRow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idClient: leadId }) // 🔹 Enviando o ID correto
            });
    
            const result = await res.json();
            if (result.status === 'ok') {
                setLeads(leads.filter(lead => lead.idClient !== leadId));
                setAllData(allData.filter(lead => lead.idClient !== leadId));
                alert('Lead excluído com sucesso!');
            } else {
                alert('Erro ao excluir lead.');
            }
        } catch (error) {
            console.error('Erro ao excluir lead:', error);
            alert('Erro ao excluir lead.');
        }
    };
    
    
    return (
        <main className="bg-slate-800 min-h-screen flex flex-col items-center justify-center p-6">
            <img src="/iconeEmpresa.png" alt="Logo" className="absolute top-8 left-6 w-35 h-auto" />

            {screen === null && (
                <div className='bg-slate-800 min-h-screen flex flex-col items-center justify-center'>

                {/* Título Centralizado */}
                <h1 className="text-white text-4xl font-bold text-center mb-8">CONTROLE DE LEADS</h1>

                {/* Botões da Tela inicial */}
                <div className="flex flex-col gap-4 w-full max-w-md">
                    <button 
                        onClick={() => setScreen('cadastrar')} 
                        className="bg-slate-400 rounded-md h-18 w-full font-bold text-lg text-center"
                    >
                        CADASTRAR NOVO
                    </button>

                    <button 
                        onClick={() => setScreen('editar')} 
                        className="bg-slate-400 rounded-md h-18 w-full font-bold text-lg text-center"
                    >
                        ATUALIZAR LEAD
                    </button>

                    <button 
                        onClick={() => setScreen('visualizar')} 
                        className="bg-slate-400 rounded-md h-18 w-full font-bold text-lg text-center"
                    >
                        VISUALIZAR LEADS
                    </button>

                    <button 
                            onClick={() => setScreen('posVenda')} 
                            className="bg-slate-400 rounded-md h-18 w-full font-bold text-lg text-center"
                        >
                            PÓS VENDA
                        </button>
                </div>

                </div>
            )}

            {screen === 'cadastrar' && (
                <div className='bg-white rounded p-10 max-w-2xl w-full flex flex-col gap-3 mt-6'>

                    {/* Título Centralizado */}
                    <h2 className="text-xl font-bold mb-4 text-gray-900 text-center">Cadastrar Novo Lead</h2>

                    {/* ID do Cliente */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="idClient" className='text-[12px] font-bold uppercase'>ID do Cliente</label>
                        <input 
                            type="text" 
                            id="idClient" 
                            name="idClient" 
                            placeholder="Crie um ID de acesso para o cliente..."
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                            value={form.idClient}
                            onChange={e => setForm({...form, idClient: e.target.value})}
                        />
                    </div>

                    {/* Nome do Cliente */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="clientName" className='text-[12px] font-bold uppercase'>Nome do Cliente</label>
                        <input 
                            type="text" 
                            id="clientName" 
                            name="clientName" 
                            placeholder="Nome completo do cliente..."
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                            value={form.clientName}
                            onChange={e => setForm({...form, clientName: e.target.value})}
                        />
                    </div>

                    {/* Nº do Processo */}
                    <div className='flex flex-col gap-1'>
                    <label htmlFor="nProposta" className='text-[12px] font-bold uppercase'>N° do Processo</label>
                    <input
                        type="number"
                        id="nProposta"
                        value={form.nProposta}
                        onChange={e => setForm({...form, nProposta: e.target.value})}
                        className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                    />
                    </div>

                    {/* Data de Recebimento */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="date" className='text-[12px] font-bold uppercase'>Data de Recebimento do Lead</label>
                        <input 
                            type="text" 
                            id="date" 
                            name="date" 
                            placeholder="Digite a data (Ex.: 10/03/2025)..."
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                            value={form.date}
                            onChange={e => setForm({...form, date: e.target.value})}
                        />
                    </div>

                    {/* Registro da Origem */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="optionsRegistro" className='text-[12px] font-bold uppercase'>Registro da Origem</label>
                        <select 
                            id="optionsRegistro" 
                            name="optionsRegistro" 
                            value={form.optionsRegistro}
                            onChange={e => setForm({...form, optionsRegistro: e.target.value})}
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                        >
                            <option value="" disabled>Selecione uma opção...</option>
                            <option value="Site">Site</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Indicação">Indicação</option>
                            <option value="Redes Sociais">Redes Sociais</option>
                            <option value="Evento">Evento</option>
                        </select>
                    </div>

                    {/* Tentativas de Contato */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="optionsTentativaContato" className='text-[12px] font-bold uppercase'>Tentativas de Contato</label>
                        <select 
                            id="optionsTentativaContato" 
                            name="optionsTentativaContato" 
                            value={form.optionsTentativaContato}
                            onChange={e => setForm({...form, optionsTentativaContato: e.target.value})}
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                        >
                            <option value="" disabled>Selecione uma opção...</option>
                            <option value="1° tentativa de contato">1° tentativa</option>
                            <option value="2° tentativa de contato">2° tentativa</option>
                            <option value="3° tentativa de contato">3° tentativa</option>
                            <option value="4° tentativa de contato">4° tentativa</option>
                            <option value="5° tentativa de contato">5° tentativa</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="status" className='text-[12px] font-bold uppercase'>Status</label>
                        <select 
                            id="status" 
                            name="status" 
                            value={form.status}
                            onChange={e => setForm({...form, status: e.target.value})}
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                        >
                            <option value="" disabled>Selecione uma opção...</option>
                            <option value="Sem interesse">Sem interesse</option>
                            <option value="Convertido">Convertido</option>
                            <option value="Em andamento">Em andamento</option>
                        </select>
                    </div>

                    {/* Follow-up */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="followUp" className='text-[12px] font-bold uppercase'>Follow-up</label>
                        <select 
                            id="followUp" 
                            name="followUp"
                            value={form.followUp}
                            onChange={e => setForm({...form, followUp: e.target.value})} 
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                        >
                            <option value="" disabled>Selecione uma opção...</option>
                            <option value="Pendente">Pendente</option>
                            <option value="Não necessário">Não necessário</option>
                            <option value="Realizado">Realizado</option>
                        </select>
                    </div>

                    {/* Botão de Salvar */}
                    <button 
                        onClick={handleSubmit} 
                        className="bg-slate-500 text-white px-4 py-2 rounded mt-4"
                    >
                        Salvar
                    </button>

                    {/* Botão de Voltar */}
                    <button 
                        onClick={() => setScreen(null)} 
                        className="text-gray-500 mt-2"
                    >
                        Voltar
                    </button>
                </div>
            )}

            {screen === 'editar' && (
                <div className='bg-white rounded p-10 max-w-2xl w-full flex flex-col gap-3 mt-6'>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 text-center">Atualizar informações do Lead</h2>

                    {/* ID do Cliente */}
                    <label htmlFor="idClient" className='text-[12px] font-bold uppercase'>ID do Cliente</label>
                    <input 
                        type="text" 
                        placeholder="Digite o ID do Cliente..." 
                        className='bg-gray-300 rounded h-10 px-2 text-gray-600 w-full' 
                        value={inputId} 
                        onChange={handleIDChange} 
                    />
                    {isSearching && <p className="text-blue-500 text-sm mt-2">Buscando...</p>}

                     {/* Número de Registros Encontrados */}
                    {matchingRows > 0 && (
                        <p className="text-gray-600 text-sm mt-2">
                            Encontrado {matchingRows} registros para este ID.
                        </p>
                    )}

                    {/* Nome do Cliente (Preenchido Automaticamente) */}
                    <label htmlFor="clientName" className='text-[12px] font-bold uppercase'>Nome do Cliente</label>
                    <input 
                        type="text" 
                        placeholder="Nome do Cliente" 
                        className='bg-gray-300 rounded h-10 px-2 text-gray-600'  
                        value={form.clientName} 
                        disabled 
                    />

                    <label htmlFor="nProposta" className='text-[12px] font-bold uppercase'>N° da Proposta</label>
                    <input
                    type="number"
                    id="nProposta"
                    name="nProposta"
                    placeholder="Digite o nº da proposta..."
                    className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                    value={form.nProposta || ''}
                    onChange={e => setForm({...form, nProposta: e.target.value})}
                    disabled={!form.clientName}
                    />


                    {/* Data de Recebimento */}
                    <label htmlFor="date" className='text-[12px] font-bold uppercase'>Data de Atualização</label>
                    <input 
                        type="text" 
                        placeholder="Data de atualização..." 
                        className='bg-gray-300 rounded h-10 px-2 text-gray-600' 
                        value={form.date} 
                        onChange={e => setForm({...form, date: e.target.value})} 
                        disabled={!form.clientName} 
                    />

                    {/* Registro da Origem */}
                    <label htmlFor="optionsRegistro" className="text-[12px] font-bold uppercase">Local de Registro</label>
                    <select className="bg-gray-300 rounded h-10 px-2 text-gray-600" value={form.optionsRegistro} onChange={e => setForm({...form, optionsRegistro: e.target.value})} disabled={!form.clientName}>
                        <option value="">Registro...</option>
                        <option value="Site">Site</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Indicação">Indicação</option>
                        <option value="Redes Sociais">Redes Sociais</option>
                        <option value="Evento">Evento</option>
                    </select>

                    {/* Tentativas de Contato */}
                    <label htmlFor="optionsTentativaContato" className="text-[12px] font-bold uppercase">Tentativas de Contato</label>
                    <select className="bg-gray-300 rounded h-10 px-2 text-gray-600" value={form.optionsTentativaContato} onChange={e => setForm({...form, optionsTentativaContato: e.target.value})} disabled={!form.clientName}>
                        <option value="">N° da Tentativa de Contato...</option>
                        <option value="1° tentativa de contato">1° tentativa</option>
                        <option value="2° tentativa de contato">2° tentativa</option>
                        <option value="3° tentativa de contato">3° tentativa</option>
                        <option value="4° tentativa de contato">4° tentativa</option>
                        <option value="5° tentativa de contato">5° tentativa</option>
                    </select>

                    {/* Status */}
                    <label htmlFor="status" className="text-[12px] font-bold uppercase">Status</label>
                    <select className="bg-gray-300 rounded h-10 px-2 text-gray-600" value={form.status} onChange={e => setForm({...form, status: e.target.value})} disabled={!form.clientName}>
                        <option value="">Status...</option>
                        <option value="Sem interesse">Sem interesse</option>
                        <option value="Convertido">Convertido</option>
                        <option value="Em andamento">Em andamento</option>
                    </select>

                    {/* Follow-up */}
                    <label htmlFor="followUp" className="text-[12px] font-bold uppercase">Follow-up</label>
                    <select className="bg-gray-300 rounded h-10 px-2 text-gray-600" value={form.followUp} onChange={e => setForm({...form, followUp: e.target.value})} disabled={!form.clientName}>
                        <option value="">Follow-up...</option>
                        <option value="Pendente">Pendente</option>
                        <option value="Não necessário">Não necessário</option>
                        <option value="Realizado">Realizado</option>
                    </select>

                    {/* Botão de Salvar */}
                    <button onClick={handleSubmit} className="bg-slate-500 text-white px-4 py-2 rounded mt-4" disabled={!form.clientName}>Salvar</button>

                    {/* Botão de Voltar */}
                    <button onClick={() => setScreen(null)} className="text-gray-500 mt-">Voltar</button>
                </div>
            )}

            {screen === 'visualizar' && (
            <div className="bg-white rounded p-10 max-w-screen-lg w-full mx-auto flex flex-col gap-4 mt-6 relative">

                {/* Cabeçalho */}
                <div className="relative w-full">
                <h2 className="text-xl font-bold text-gray-900 text-center mt-4">Visualizar Leads</h2>
                <a 
                    href="https://www.exemplo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-0 top-0 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                >
                    Análise Visual
                </a>
                </div>

                {/* Campo de pesquisa + dropdown */}
                <div className="flex flex-col items-center relative">
                <input
                    type="text"
                    placeholder="Digite o ID ou Nome..."
                    className="bg-gray-300 rounded h-10 px-4 text-gray-600 w-full max-w-md text-center"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onFocus={() => setShowDropdown(true)}
                />
                <button onClick={() => setScreen(null)} className="bg-slate-500 text-white px-4 py-2 rounded mt-4">Voltar</button>

                {showDropdown && searchQuery.trim() && (
                    <div className="absolute top-12 w-full max-w-md bg-white border rounded shadow max-h-60 overflow-auto">
                    {[...new Map(
                        allData
                        .filter(l =>
                            l.idClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            l.clientName.toLowerCase().includes(searchQuery.toLowerCase())
                        )
                        .map(l => [l.idClient, l])
                    ).values()].map((lead, i) => (
                        <div
                        key={i}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => { setSearchQuery(lead.idClient); setShowDropdown(false); }}
                        >
                        {lead.idClient} — {lead.clientName}
                        </div>
                    ))}
                    </div>
                )}
                </div>

                {/* Resultados agrupados */}
                <div className="space-y-6 mt-6">
                {searchQuery.trim() && (() => {
                    const leadRows = allData.filter(l => l.idClient === searchQuery);
                    if (!leadRows.length) return <p className="text-center">Nenhum lead encontrado.</p>;

                    const clientName = leadRows[0].clientName;
                    return (
                    <div>
                        <h3 className="text-lg font-bold mb-4">{searchQuery} — {clientName}</h3>

                        {Object.entries(
                        leadRows.reduce((acc, row) => { (acc[row.nProposta] ||= []).push(row); return acc }, {})
                        )
                        .sort(([, a], [, b]) => {
                        const lastA = a[a.length-1].date.split('/').reverse().join('-');
                        const lastB = b[b.length-1].date.split('/').reverse().join('-');
                        return new Date(lastB) - new Date(lastA);
                        })
                        .map(([nProposta, entries]) => {
                        const key = `${searchQuery}-${nProposta}`;
                        const latest = entries[entries.length-1];
                        const isOpen = expandedProposals[key] || false;

                        return (
                            <div key={key} className="border-b pb-4 relative">
                            <button
                                className="w-full flex justify-between items-center p-2 hover:bg-gray-100"
                                onClick={() => setExpandedProposals(prev => ({ ...prev, [key]: !prev[key] }))}
                            >
                                <span className="font-semibold">{latest.date} — Proposta: {nProposta}</span>
                                <div className="flex items-center gap-4">
                                {entries.some(item => item.status === 'Convertido') && (
                                    <span
                                    className="text-blue-500 cursor-pointer"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setExpandedProposals(prev => ({ ...prev, [`pos-${key}`]: !prev[`pos-${key}`] }));
                                    }}
                                    >
                                    Pós‑venda
                                    </span>
                                )}
                                <span>{isOpen ? '▲' : '▼'}</span>
                                </div>
                            </button>

                            {/* Popover Pós‑venda */}
                            {expandedProposals[`pos-${key}`] && (
                                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                    <div className="bg-blue-100 w-11/12 sm:w-3/4 md:w-1/2 lg:w-2/5 p-6 rounded-lg shadow-lg relative">
                                    {/* Cabeçalho do modal */}
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-lg font-bold">{latest.idClient} — Proposta {nProposta}</h4>
                                        <button
                                        onClick={() => setExpandedProposals(prev => ({ ...prev, [`pos-${key}`]: false }))}
                                        className="text-gray-600 hover:text-gray-800"
                                        >
                                        ✕
                                        </button>
                                    </div>

                                    {/* Conteúdo Pós‑venda */}
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {allPosVenda
                                        .filter(pv => pv.idClient === searchQuery && pv.nProposta === nProposta)
                                        .sort((a,b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')))
                                        .map((pv, i) => (
                                            <p key={i} className="text-sm">
                                            {pv.date} — Status Pós‑venda: {pv.posStatus}
                                            </p>
                                        ))
                                        }
                                    </div>
                                    </div>
                                </div>
                            )}


                            {/* Histórico principal */}
                            {isOpen && (
                                <div className="ml-4 mt-2 space-y-2">
                                {entries.map((item,i) => (
                                    <div key={i} className="bg-gray-100 p-2 rounded flex justify-between">
                                    <div>
                                        <p className="text-sm">{item.date} | Origem: {item.optionsRegistro}</p>
                                        <p className="text-sm">Tentativas: {item.optionsTentativaContato} • Status: {item.status} • Follow‑up: {item.followUp}</p>
                                    </div>
                                    <button onClick={() => handleDelete(item.idClient)}>
                                        <FaTrash className="text-red-500 hover:text-red-700"/>
                                    </button>
                                    </div>
                                ))}
                                </div>
                            )}
                            </div>
                        );
                        })}
                    </div>
                    );
                })()}
                </div>
            </div>
            )}



            {screen === 'posVenda' && (
                <div className='bg-white rounded p-10 max-w-2xl w-full flex flex-col gap-3 mt-6'>
                    <h2 className="text-xl font-bold mb-4 text-gray-900 text-center">Controle de Pós-Venda</h2>

                    {/* ID do Cliente */}
                    <label htmlFor="idClient" className='text-[12px] font-bold uppercase'>ID do Cliente</label>
                    <input 
                        type="text" 
                        placeholder="Digite o ID do Cliente..." 
                        className='bg-gray-300 rounded h-10 px-2 text-gray-600 w-full' 
                        value={inputId} 
                        onChange={handleIDChange} 
                    />
                    {isSearching && <p className="text-blue-500 text-sm mt-2">Buscando...</p>}

                     {/* Número de Registros Encontrados */}
                    {matchingRows > 0 && (
                        <p className="text-gray-600 text-sm mt-2">
                            Encontrado {matchingRows} registros para este ID.
                        </p>
                    )}

                    {/* Nome do Cliente (Preenchido Automaticamente) */}
                    <label htmlFor="clientName" className='text-[12px] font-bold uppercase'>Nome do Cliente</label>
                    <input 
                        type="text" 
                        placeholder="Nome do Cliente" 
                        className='bg-gray-300 rounded h-10 px-2 text-gray-600'  
                        value={form.clientName} 
                        disabled 
                    />

                    <label htmlFor="nProposta" className='text-[12px] font-bold uppercase'>N° da Proposta</label>
                    <input
                    type="number"
                    id="nProposta"
                    name="nProposta"
                    placeholder="Digite o nº da proposta..."
                    className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                    value={form.nProposta || ''}
                    onChange={e => setForm({...form, nProposta: e.target.value})}
                    disabled={!form.clientName}
                    />


                    {/* Data de Recebimento */}
                    <label htmlFor="date" className='text-[12px] font-bold uppercase'>Data de Atualização</label>
                    <input 
                        type="text" 
                        placeholder="Data de atualização..." 
                        className='bg-gray-300 rounded h-10 px-2 text-gray-600' 
                        value={form.date} 
                        onChange={e => setForm({...form, date: e.target.value})} 
                        disabled={!form.clientName} 
                    />

                {/* Pós-Venda */}
                <label htmlFor="posVenda" className="text-[12px] font-bold uppercase">Acompanhamento Pós-venda</label>
                    <select className="bg-gray-300 rounded h-10 px-2 text-gray-600" value={form.posVenda} onChange={e => setForm({...form, posVenda: e.target.value})} disabled={!form.clientName}>
                        <option value="">Acompanhamento Pós-venda...</option>
                        <option value="Não iniciado">Não iniciado</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                {/* Botão de Salvar */}    
                <button onClick={handleSubmitPosVenda} className="bg-slate-500 text-white px-4 py-2 rounded mt-4">Salvar</button>
                <button onClick={()=>setScreen(null)}>Voltar</button>
            </div>
            )}


        </main>
    );
}

