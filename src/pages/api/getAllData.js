import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Método não permitido' });

    try {
        const auth = await getGoogleAuth();
        const sheets = google.sheets({ version: 'v4', auth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SPREADSHEET_ID, 
            range: "A:H"
        });

        res.status(200).json({ data: response.data.values || [] });
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        res.status(500).json({ message: 'Erro ao buscar dados', error: error.message || error });
    }
}
