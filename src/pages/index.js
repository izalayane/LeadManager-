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
    const [form, setForm] = useState({
        idClient: '',
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
        const fetchData = async () => {
            try {
                const response = await fetch('/api/getAllData');
                const result = await response.json();
    
                if (result.data) {
                    const formattedData = result.data.map(row => ({
                        idClient: row[0] || "",
                        clientName: row[1] || "",
                        date: row[2] || "",
                        optionsRegistro: row[3] || "",
                        optionsTentativaContato: row[4] || "",
                        status: row[5] || "",
                        followUp: row[6] || "",
                        posVenda: row[7] || ""
                    }));
    
                    setLeads(formattedData);
                    setAllData(formattedData); 
                }
            } catch (error) {
                console.error("Erro ao buscar os dados:", error);
            }
        };
    
        fetchData();
    }, []);
    
    

    // Função para cadastrar novo lead
    const handleSubmit = async () => {
        if (!form.idClient || !form.clientName || !form.date || !form.optionsRegistro || !form.optionsTentativaContato || !form.status || !form.followUp || !form.posVenda) {
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
            } else {
                alert("Erro ao cadastrar lead.");
            }
        } catch (error) {
            console.error("Erro ao cadastrar lead:", error);
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
                            date: latestLead.date, // Exibe no formato original DD/MM/YYYY
                            optionsRegistro: latestLead.optionsRegistro,
                            optionsTentativaContato: latestLead.optionsTentativaContato,
                            status: latestLead.status,
                            followUp: latestLead.followUp,
                            posVenda: latestLead.posVenda
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
        <main className='bg-slate-800 min-h-screen flex flex-col items-center justify-center'>

        {/* Título Centralizado */}
        <h1 className="text-white text-4xl font-bold text-center mb-8">CONTROLE DE LEADS</h1>

        {/* Botões da Tela inicial */}
        <div className="flex flex-col gap-4 w-full max-w-md">
            <button 
                onClick={() => setScreen('cadastrar')} 
                className="bg-slate-400 rounded-md h-18 w-full font-bold text-lg text-center"
            >
                CADASTRAR NOVO LEAD
            </button>

            <button 
                onClick={() => setScreen('editar')} 
                className="bg-slate-400 rounded-md h-18 w-full font-bold text-lg text-center"
            >
                EDITAR LEAD
            </button>

            <button 
                onClick={() => setScreen('visualizar')} 
                className="bg-slate-400 rounded-md h-18 w-full font-bold text-lg text-center"
            >
                VISUALIZAR LEADS
            </button>
        </div>

        </main>
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

                    {/* Pós-Venda */}
                    <div className='flex flex-col gap-1'>
                        <label htmlFor="posVenda" className='text-[12px] font-bold uppercase'>Acompanhamento Pós-venda</label>
                        <select 
                            id="posVenda" 
                            name="posVenda" 
                            value={form.posVenda}
                            onChange={e => setForm({...form, posVenda: e.target.value})}
                            className='bg-gray-300 rounded h-10 px-2 text-gray-600'
                        >
                            <option value="" disabled>Selecione uma opção...</option>
                            <option value="Não iniciado">Não iniciado</option>
                            <option value="Em andamento">Em andamento</option>
                            <option value="Concluído">Concluído</option>
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

                    {/* Pós-Venda */}
                    <label htmlFor="posVenda" className="text-[12px] font-bold uppercase">Acompanhamento Pós-venda</label>
                    <select className="bg-gray-300 rounded h-10 px-2 text-gray-600" value={form.posVenda} onChange={e => setForm({...form, posVenda: e.target.value})} disabled={!form.clientName}>
                        <option value="">Acompanhamento Pós-venda...</option>
                        <option value="Não iniciado">Não iniciado</option>
                        <option value="Em andamento">Em andamento</option>
                        <option value="Concluído">Concluído</option>
                    </select>

                    {/* Botão de Salvar */}
                    <button onClick={handleSubmit} className="bg-slate-500 text-white px-4 py-2 rounded mt-4" disabled={!form.clientName}>Salvar</button>

                    {/* Botão de Voltar */}
                    <button onClick={() => setScreen(null)} className="text-gray-500 mt-">Voltar</button>
                </div>
            )}



            {screen === 'visualizar' && (
                <div className='bg-white rounded p-10 max-w-5xl w-full flex flex-col gap-4 mt-6'>

                    {/* 🔹 Cabeçalho com título e botão no mesmo nível */}
                    <div className="relative w-full">
                        {/* Título da tela */}
                        <h2 className="text-xl font-bold text-gray-900 text-center mt-10">Visualizar Leads</h2>

                        {/* Botão "Análise Visual" alinhado à direita */}
                        <a 
                            href="https://www.exemplo.com"  // 🔹 Substitua pelo link correto
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute right-[-20px] top-[-20px] right-0 bg-blue-600 text-white px-4 py-2 rounded shadow-md hover:bg-blue-700 transition"
                        >
                            Análise Visual
                        </a>
                    </div>
                    {/* Campo de pesquisa por ID ou Nome */}
                    <div className="flex flex-col items-center relative">
                        <input 
                            type="text" 
                            placeholder="Digite o ID ou Nome..." 
                            className="bg-gray-300 rounded h-10 px-4 text-gray-600 text-center w-2/3"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 200)} // Esconde a lista ao sair do campo
                            onFocus={() => setShowDropdown(true)} // Mostra a lista ao focar no campo
                        />

                        {/* Botão de Voltar */}
                        <button onClick={() => setScreen(null)} className="bg-slate-500 text-white px-4 py-2 rounded mt-6">
                            Voltar
                        </button>

                        {/* Lista suspensa sem repetições */}
                        {showDropdown && searchQuery.trim() !== "" && (
                            <div className="absolute top-12 w-2/3 bg-white border border-gray-300 rounded shadow-md max-h-60 overflow-y-auto">
                                {[...new Map(allData
                                    .filter(lead =>
                                        lead.idClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        lead.clientName.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .map(lead => [lead.idClient, lead]) // Remove duplicatas mantendo apenas um representante
                                ).values()].map((lead, index) => (
                                    <div 
                                        key={index} 
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                        onClick={() => {
                                            setSearchQuery(lead.idClient);
                                            setShowDropdown(false); // Esconde a lista ao selecionar um item
                                        }}
                                    >
                                        {lead.idClient} - {lead.clientName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Exibição dos Leads agrupados por ID */}
                    <div className="space-y-6 mt-6">
                        {searchQuery.trim() !== "" && allData.length > 0 ? (
                            Object.entries(
                                allData
                                    .filter(lead =>
                                        lead.idClient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        lead.clientName.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                    .reduce((acc, lead) => {
                                        if (!acc[lead.idClient]) acc[lead.idClient] = [];
                                        acc[lead.idClient].push(lead);
                                        return acc;
                                    }, {})
                            ).map(([id, leadData]) => (
                                <div key={id} className="border-b pb-4">
                                    {/* ID + Nome em Destaque */}
                                    <h3 className="text-lg font-bold text-gray-800">{id} - {leadData[0].clientName}</h3>

                                    {/* Histórico de Informações (Ordenado por Data Mais Recente) */}
                                    {leadData.sort((a, b) => {
                                        const [dayA, monthA, yearA] = a.date.split('/');
                                        const [dayB, monthB, yearB] = b.date.split('/');
                                        return new Date(`${yearB}-${monthB}-${dayB}`) - new Date(`${yearA}-${monthA}-${dayA}`);
                                    }).map((item, i) => (
                                        <div key={i} className="ml-4 bg-gray-100 p-2 rounded mt-2 flex justify-between items-center">
                                            <div>
                                                <p className="text-gray-700 text-sm font-semibold">{item.date}</p>
                                                <p className="text-gray-600 text-sm">Origem: {item.optionsRegistro}</p>
                                                <p className="text-gray-600 text-sm">Tentativas de Contato: {item.optionsTentativaContato}</p>
                                                <p className="text-gray-600 text-sm">Status: {item.status}</p>
                                                <p className="text-gray-600 text-sm">Follow-up: {item.followUp}</p>
                                                <p className="text-gray-600 text-sm">Pós-venda: {item.posVenda}</p>
                                            </div>
                                            {/* Ícone de Lixeira para Excluir */}
                                            <button onClick={() => handleDelete(item.idClient)} className="text-red-500 hover:text-red-700">
                                                <FaTrash />
                                            </button>


                                        </div>
                                    ))}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center">Nenhum lead encontrado.</p>
                        )}
                    </div>

                </div>
            )}




        </main>
    );
}

