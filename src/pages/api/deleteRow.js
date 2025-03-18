import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth';

export default async function handler(req, res) {
    console.log("🟢 [LOG] - Iniciando a exclusão de lead");

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { idClient } = req.body;
    console.log("🟢 [LOG] - ID recebido para exclusão:", idClient);

    if (!idClient) {
        console.log("🛑 [ERRO] - ID do lead inválido:", idClient);
        return res.status(400).json({ message: 'ID do lead inválido' });
    }

    try {
        console.log("🟢 [LOG] - Autenticando no Google Sheets...");
        const auth = await getGoogleAuth();
        const sheets = google.sheets({ version: 'v4', auth });
        console.log("✅ [LOG] - Autenticação bem-sucedida!");

        // 🔹 Obtendo os dados atuais para encontrar a linha correta
        console.log("🟢 [LOG] - Buscando os dados da planilha...");
        const sheetInfo = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID,
            range: "A:H" // Garante que estamos buscando todas as colunas necessárias
        });

        const rows = sheetInfo.data.values;
        if (!rows || rows.length === 0) {
            console.log("🛑 [ERRO] - Nenhum dado encontrado na planilha!");
            return res.status(404).json({ message: 'Nenhum dado encontrado' });
        }

        // 🔹 Encontrar a linha correta pelo ID do cliente
        const rowIndex = rows.findIndex(row => row[0] === idClient);
        if (rowIndex === -1) {
            console.log("🛑 [ERRO] - ID não encontrado na planilha:", idClient);
            return res.status(404).json({ message: 'Lead não encontrado' });
        }

        console.log("🟢 [LOG] - Excluindo a linha correta na posição:", rowIndex + 1);

        // 🔹 Pegando o sheetId correto
        const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId: process.env.SPREADSHEET_ID });
        const sheetId = sheetMetadata.data.sheets[0].properties.sheetId;

        // 🔹 Excluir a linha correta
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: process.env.SPREADSHEET_ID,
            requestBody: {
                requests: [{
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex, // Agora exclui a linha certa!
                            endIndex: rowIndex + 1
                        }
                    }
                }]
            }
        });

        console.log("✅ [LOG] - Lead excluído com sucesso!");
        return res.status(200).json({ status: 'ok' });

    } catch (error) {
        console.error("🛑 [ERRO] - Falha ao excluir lead:", error);
        return res.status(500).json({ message: 'Erro ao excluir lead', error: error.message || error });
    }
};
