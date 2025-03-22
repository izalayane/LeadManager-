import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth'; 

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { idClient, clientName, nProposta, date, optionsRegistro, optionsTentativaContato, status, followUp} = req.body;
    if (!idClient || !clientName || !nProposta || !date || !optionsRegistro || !optionsTentativaContato || !status || !followUp) {
        return res.status(400).json({ message: 'Missing fields' });
    }

    try {
        const auth = await getGoogleAuth(); 
        const sheets = google.sheets({ version: 'v4', auth });

        const spreadsheetId = process.env.SPREADSHEET_ID;
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: "A:H",
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [[idClient, clientName, nProposta, date, optionsRegistro, optionsTentativaContato, status, followUp]]
            }
        });

        return res.status(200).json({ status: 'ok', data: response.data });
    } catch (error) {
        console.error('Erro ao adicionar dados na planilha:', error);
        return res.status(500).json({ message: 'Erro ao salvar dados na planilha', error: error.message || error });
    }
}
