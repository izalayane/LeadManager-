import { google } from 'googleapis';
import { getGoogleAuth } from './googleAuth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  const { idClient, clientName, nProposta, date, posVenda } = req.body;

  if (!idClient || !clientName || !nProposta || !date || !posVenda) {
    return res.status(400).json({ message: 'Campos faltando no body' });
  }

  try {
    const auth = await getGoogleAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'posvenda!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        // Gravamos na ordem [idClient, clientName, nProposta, date, posVenda]
        values: [[idClient, clientName, nProposta, date, posVenda]]
      }
    });

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Erro ao adicionar Pós‑venda:', error);
    return res.status(500).json({
      message: 'Erro ao salvar pós‑venda',
      error: error.message
    });
  }
}
