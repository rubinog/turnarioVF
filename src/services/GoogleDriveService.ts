const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

if (!API_KEY) {
  console.error('❌ VITE_GOOGLE_API_KEY not configured. Google Drive features will not work.');
}
if (!CLIENT_ID) {
  console.error('❌ VITE_GOOGLE_CLIENT_ID not configured. Google Drive features will not work.');
}
const BACKUP_FILENAME = 'turnario_vvf_backup.json';

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGoogleScripts = (onInited: () => void) => {
    if (!API_KEY || !CLIENT_ID) {
        console.error('Cannot initialize Google Scripts: credentials missing');
        return;
    }
    
    const checkInited = () => {
        if (gapiInited && gisInited) {
            onInited();
        }
    };

    // Initialize GAPI
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        checkInited();
    });

    // Initialize GIS
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined at request time
    });
    gisInited = true;
    checkInited();
};

export const login = (): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            tokenClient.callback = async (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                }
                resolve(gapi.client.getToken().access_token);
            };

            if (gapi.client.getToken() === null) {
                // Prompt the user to select a Google Account and ask for consent back use their data
                tokenClient.requestAccessToken({ prompt: 'consent' });
            } else {
                // Skip display of account chooser and consent dialog or display it only if necessary
                tokenClient.requestAccessToken({ prompt: '' });
            }
        } catch (err) {
            reject(err);
        }
    });
};

export const logout = () => {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
        });
    }
};

export const findBackupFile = async () => {
    const response = await gapi.client.drive.files.list({
        q: `name = '${BACKUP_FILENAME}' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });
    const files = response.result.files;
    return files && files.length > 0 ? files[0] : null;
};

export const uploadBackup = async (content: string) => {
    const existingFile = await findBackupFile();
    const fileId = existingFile ? existingFile.id : null;

    const metadata = {
        name: BACKUP_FILENAME,
        mimeType: 'application/json',
    };

    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        content +
        close_delim;

    const path = fileId
        ? `/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : '/upload/drive/v3/files?uploadType=multipart';

    const method = fileId ? 'PATCH' : 'POST';

    return gapi.client.request({
        path: path,
        method: method,
        params: { uploadType: 'multipart' },
        headers: {
            'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        },
        body: multipartRequestBody,
    });
};

export const downloadBackup = async (fileId: string) => {
    const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
    });
    return response.body;
};

// Declare global types for Google scripts
declare global {
    const gapi: any;
    const google: any;
}
