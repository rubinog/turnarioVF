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
let initPromise: Promise<void> | null = null;

const GOOGLE_INIT_TIMEOUT_MS = 10000;

const assertConfigured = () => {
    if (!API_KEY || !CLIENT_ID) {
        throw new Error('Google Drive non configurato: imposta VITE_GOOGLE_API_KEY e VITE_GOOGLE_CLIENT_ID.');
    }
};

const waitForGoogleGlobals = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        const startedAt = Date.now();

        const check = () => {
            if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
                resolve();
                return;
            }

            if (Date.now() - startedAt > GOOGLE_INIT_TIMEOUT_MS) {
                reject(new Error('Script Google non caricati. Verifica connessione o blocchi del browser (adblock/privacy).'));
                return;
            }

            setTimeout(check, 200);
        };

        check();
    });
};

const initGapiClient = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            gapi.load('client', async () => {
                try {
                    if (!gapiInited) {
                        await gapi.client.init({
                            apiKey: API_KEY,
                            discoveryDocs: [DISCOVERY_DOC],
                        });
                        gapiInited = true;
                    }
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

const initGisClient = () => {
    if (gisInited && tokenClient) return;

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: () => { },
    });
    gisInited = true;
};

const ensureGoogleInitialized = async (): Promise<void> => {
    assertConfigured();

    if (gapiInited && gisInited && tokenClient) {
        return;
    }

    if (!initPromise) {
        initPromise = (async () => {
            await waitForGoogleGlobals();
            await initGapiClient();
            initGisClient();
        })();
    }

    try {
        await initPromise;
    } finally {
        initPromise = null;
    }
};

export const initGoogleScripts = (onInited: () => void) => {
    ensureGoogleInitialized()
        .then(onInited)
        .catch((error) => {
            console.error('Google init error:', error);
        });
};

export const login = async (): Promise<string> => {
    await ensureGoogleInitialized();

    return new Promise((resolve, reject) => {
        try {
            if (!tokenClient) {
                reject(new Error('Client Google OAuth non inizializzato.'));
                return;
            }

            tokenClient.callback = async (resp: any) => {
                if (resp.error !== undefined) {
                    reject(resp);
                    return;
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
    if (typeof gapi === 'undefined' || typeof google === 'undefined') return;

    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token, () => {
            gapi.client.setToken(null);
        });
    }
};

export const findBackupFile = async () => {
    await ensureGoogleInitialized();

    const response = await gapi.client.drive.files.list({
        q: `name = '${BACKUP_FILENAME}' and trashed = false`,
        fields: 'files(id, name)',
        spaces: 'drive',
    });
    const files = response.result.files;
    return files && files.length > 0 ? files[0] : null;
};

export const uploadBackup = async (content: string) => {
    await ensureGoogleInitialized();

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
    await ensureGoogleInitialized();

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
