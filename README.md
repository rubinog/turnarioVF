# 🚒 Turnario Vigili del Fuoco

Un'applicazione moderna e intuitiva progettata per la gestione dei turni del personale dei Vigili del Fuoco. Sviluppata per offrire precisione, chiarezza visiva e un'esperienza utente premium.

![Version](https://img.shields.io/badge/version-a6671fc-a90708?style=flat-square)
![Tech Stack](https://img.shields.io/badge/tech-React%20%2B%20TypeScript%20%2B%20Vite-blue?style=flat-square)
![Styling](https://img.shields.io/badge/styling-UnoCSS-333333?style=flat-square)

## ✨ Caratteristiche Principali

- **📅 Calendario Intuitivo:** Visualizzazione chiara dei turni diurni e notturni con logica di calcolo automatica basata sulla squadra di appartenenza.
- **🎨 Brand VVF:** Interfaccia utente personalizzata con i colori istituzionali dei Vigili del Fuoco (#a90708).
- **📝 Gestione Attività:** Possibilità di tenere traccia di richieste Ferie, Permessi, Recuperi e Note per ogni singola giornata.
- **⏱️ Straordinari e Servizi a Pagamento:** Tracciamento dettagliato delle ore di straordinario e dei Servizi a Pagamento con calcolo automatico dei totali mensili.
- **📊 Reporting Avanzato:** Riepilogo mensile e annuale delle attività svolte.
- **💳 Stato Pagamenti:** Monitoraggio degli straordinari e dei servizi inviati a pagamento per non perdere mai il conto.
- **⚙️ Personalizzazione Totale:** Configurazione del salto turno, dei colori dei turni e delle tipologie di attività personalizzate.
- **🔒 Privacy First:** Tutti i dati sono salvati localmente nel browser (localStorage). Nessun dato lascia mai il tuo dispositivo.

## 🛠️ Tech Stack

- **Framework:** [React](https://reactjs.org/) con [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [UnoCSS](https://unocss.dev/) (Utility-first CSS engine)
- **Icone:** [Lucide React](https://lucide.dev/)
- **Gestione Date:** [date-fns](https://date-fns.org/)

## 🚀 Sviluppo Locale

Per eseguire il progetto in locale, segui questi passaggi:

1. **Clona il repository:**
   ```bash
   git clone https://github.com/rubinog/turnarioVF_nuovoTentativo.git
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente (opzionale):**
   - Copia `.env.example` in `.env`
   - Aggiungi le tue credenziali Google (per usare la funzionalità di backup su Google Drive)
   ```bash
   cp .env.example .env
   ```
   - Modifica il file `.env` con i tuoi valori

4. **Avvia il server di sviluppo:**
   ```bash
   npm run dev
   ```

5. **Build per la produzione:**
   ```bash
   npm run build
   ```

### Configurazione Google Drive (Facoltativo)

Se desideri abilitare la funzionalità di backup su Google Drive:
1. Crea un progetto su [Google Cloud Console](https://console.cloud.google.com/)
2. Abilita l'API di Google Drive
3. Crea credenziali OAuth 2.0 (Web application)
4. Copia l'API Key e Client ID nel tuo file `.env`

---

Sviluppato con ♥ per i Vigili del Fuoco.
