import { google } from 'googleapis';

export async function getGoogleAuth() {
    return await google.auth.getClient({
        credentials: {
            type: "service_account",
            project_id: "desafiogoat",
            private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), 
            client_email: process.env.GOOGLE_CLIENT_EMAIL 
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    });
}
