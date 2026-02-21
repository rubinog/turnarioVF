# 🚒 Turnario Vigili del Fuoco

Un'applicazione moderna e intuitiva per la gestione dei turni del personale dei Vigili del Fuoco, progettata per offrire precisione, chiarezza visiva e semplicità d'uso.

![Version](https://img.shields.io/badge/version-a6671fc-a90708?style=flat-square)
![Tech Stack](https://img.shields.io/badge/tech-React%20%2B%20TypeScript%20%2B%20Vite-blue?style=flat-square)
![Styling](https://img.shields.io/badge/styling-UnoCSS-333333?style=flat-square)

## ✨ Caratteristiche Principali

- **📅 Calendario Intuitivo:** Visualizzazione chiara dei turni diurni e notturni con logica di calcolo automatica basata sulla squadra di appartenenza.
- **🎨 Brand VVF:** Interfaccia utente personalizzata con i colori istituzionali dei Vigili del Fuoco (#a90708).
- **📝 Gestione Attività:** Possibilità di tenere traccia di richieste ferie, permessi, recuperi e note per ogni singola giornata.
- **⏱️ Straordinari e Servizi a Pagamento:** Tracciamento dettagliato delle ore di straordinario e dei servizi a pagamento con calcolo automatico dei totali mensili.
- **📊 Reporting Avanzato:** Riepilogo mensile e annuale delle attività svolte.
- **💳 Stato Pagamenti:** Monitoraggio degli straordinari e dei servizi inviati a pagamento per non perdere mai il conto.
- **⚙️ Personalizzazione Totale:** Configurazione del salto turno, dei colori dei turni e delle tipologie di attività.
- **🔒 Privacy First:** Tutti i dati sono salvati localmente nel browser (localStorage). Nessun dato lascia mai il tuo dispositivo.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/) con [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [UnoCSS](https://unocss.dev/) (Utility-first CSS engine)
- **Icone:** [Lucide React](https://lucide.dev/)
- **Gestione Date:** [date-fns](https://date-fns.org/)

## 🚀 Sviluppo Locale

Per eseguire il progetto in locale:

1. **Clona il repository:**
   ```bash
   git clone https://github.com/rubinog/turnarioVF_nuovoTentativo.git
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **(Opzionale) Configura Google Drive:**
   - Questo passaggio serve solo se vuoi usare backup/sync cloud.
   - Se usi solo salvataggio locale, puoi saltarlo.
   - Crea `.env` da `.env.example` (su Windows PowerShell puoi usare anche `Copy-Item .env.example .env`):
   ```bash
   cp .env.example .env
   ```
   - Poi segui la sezione **Configurazione Google Drive (Facoltativo)** qui sotto.

4. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

5. **Build per la produzione:**
   ```bash
   npm run build
   ```

### Configurazione Google Drive (facoltativo)

Di seguito trovi la procedura completa per ottenere `VITE_GOOGLE_API_KEY` e `VITE_GOOGLE_CLIENT_ID`.

Se desideri abilitare backup/sync su Google Drive, configura `.env` così:

```env
VITE_GOOGLE_API_KEY=la_tua_api_key
VITE_GOOGLE_CLIENT_ID=il_tuo_client_id.apps.googleusercontent.com
```

#### Caso A: Hai già un progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/) e seleziona il progetto.
2. Apri **APIs & Services → Enabled APIs & services** e verifica che **Google Drive API** sia abilitata.
3. Apri **APIs & Services → Credentials**.
4. In **API keys**, copia la tua chiave e usala come `VITE_GOOGLE_API_KEY`.
5. In **OAuth 2.0 Client IDs**, apri il client di tipo **Web application** e copia il **Client ID** in `VITE_GOOGLE_CLIENT_ID`.
6. Nel client OAuth, aggiungi in **Authorized JavaScript origins** almeno:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - (opzionale) il tuo dominio di produzione, se presente.
7. Salva e riavvia il dev server (`npm run dev`).

#### Caso B: Devi creare un nuovo progetto Google Cloud

1. Vai su [Google Cloud Console](https://console.cloud.google.com/) e crea un nuovo progetto.
2. Apri **APIs & Services → Library** e abilita **Google Drive API**.
3. Vai in **APIs & Services → OAuth consent screen** e configura la schermata consenso (app name, email, ecc.).
4. Vai in **APIs & Services → Credentials → Create credentials → API key** e copia la chiave.
5. Vai in **Create credentials → OAuth client ID**:
   - Tipo applicazione: **Web application**
   - In **Authorized JavaScript origins** inserisci:
     - `http://localhost:5173`
     - `http://localhost:5174`
6. Copia il **Client ID** generato e inserisci entrambi i valori nel file `.env`.
7. Riavvia il dev server (`npm run dev`).

> Nota sicurezza: non committare mai `.env`. Se una chiave viene esposta, rigenerala subito.

---

Sviluppato con ♥ per i Vigili del Fuoco.
