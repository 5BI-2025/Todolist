# Todo List App

Un'applicazione web moderna per la gestione delle attività, realizzata con JavaScript vanilla e stile Tailwind CSS.

## Caratteristiche

- Interfaccia drag-and-drop intuitiva
- Vista calendario per le scadenze
- Sistema di priorità a 4 livelli
- Design responsive
- Salvataggio automatico in localStorage
- Ricerca e filtro delle attività
- Liste personalizzabili e riordinabili

## Funzionalità Principali

### Gestione delle Attività
- Creazione di nuove attività con titolo, descrizione e priorità
- Impostazione delle date di scadenza
- Spostamento delle attività tra le liste via drag-and-drop
- Eliminazione delle attività

### Organizzazione
- Creazione di liste personalizzate
- Riordino delle liste tramite drag-and-drop
- Vista board con colonne
- Vista calendario per scadenze

### Priorità
- Bassa (verde)
- Media (giallo)
- Alta (rosso)
- Critica (viola)

## Tecnologie Utilizzate

- JavaScript (ES6+)
- HTML5
- Tailwind CSS
- Vite (bundler)
- FontAwesome (icone)
- localStorage (persistenza dati)

## Struttura del Progetto

```
/
├── src/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js          # Entry point
│       ├── state.js        # Gestione stato
│       ├── ui.js           # Logica UI
│       ├── builders.js     # Componenti UI
│       ├── dom.js          # Utility DOM
│       ├── drag.js         # Gestione drag-and-drop
│       └── calendar.js     # Vista calendario
├── public/
│   └── vite.svg
├── index.html
├── package.json
└── vite.config.js
```

## Installazione e Utilizzo

1. Clona il repository:
   ```bash
   git clone https://github.com/5BI-2025/Todolist.git
   ```

2. Installa le dipendenze:
   ```bash
   cd Todolist
   npm install
   ```

3. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

4. Apri il browser su `http://localhost:5173`

## Funzionalità dell'Interfaccia

### Vista Board
- Colonne per ogni stato delle attività
- Drag-and-drop tra colonne
- Contatori per attività in ogni colonna
- Pulsanti rapidi per spostamento

### Vista Calendario
- Visualizzazione mensile
- Evidenziazione delle scadenze
- Indicatori di priorità
- Navigazione tra i mesi

### Filtri e Ricerca
- Ricerca testuale in titoli e descrizioni
- Filtro per livello di priorità
- Aggiornamento in tempo reale

## Persistenza dei Dati

L'applicazione utilizza il localStorage del browser per:
- Salvare le attività
- Memorizzare le liste personalizzate
- Mantenere l'ordine delle liste

## Personalizzazione

L'interfaccia utilizza Tailwind CSS per lo stile, rendendo facile la personalizzazione attraverso:
- Classi di utilità
- Variabili di colore
- Temi personalizzati

## Licenza

Questo progetto è distribuito sotto licenza MIT. Vedere il file `LICENSE` per maggiori dettagli.

## Contributori

- Classe 5BI 2025

---

Realizzato dalla classe 5BI - 2025