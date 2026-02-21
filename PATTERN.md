# Pattern Turni Vigili del Fuoco (Guida per sviluppatori)

Questa guida descrive una logica semplice e deterministica per calcolare i turni VVF (diurno/notturno) in una app turnario.

## Modello del pattern

### Entità principali
- **Sezione**: `A | B | C | D`
- **Salto**: `1..8`
- **Turno**: combinazione `Sezione + Salto` (es. `A3`, `C7`)

### Regole del ciclo
1. La **sezione ruota ogni giorno** in questo ordine: `A -> B -> C -> D -> A ...`
2. Il **salto ruota ogni 4 giorni**: dopo 4 giorni passa al salto successivo (`1..8` circolare)
3. Il turno **notturno del giorno X** corrisponde al turno **diurno del giorno X-1**

### Logica "salto turno" per il singolo dipendente

Ogni dipendente appartiene a una combinazione fissa `Sezione+Salto` (es. `A1`).

Dato il turno del giorno (`shift.section`, `shift.skip`) e il profilo utente (`userSection`, `userSkip`):

- **Lavora** quando la sua sezione è presente ma il salto è diverso:
  - `shift.section === userSection && shift.skip !== userSkip`
- **Riposo compensativo** quando compare la sua combinazione esatta:
  - `shift.section === userSection && shift.skip === userSkip`
- **Non di competenza** quando compare una sezione diversa:
  - `shift.section !== userSection`

Esempio: utente `A1`
- lavora su `A2, A3, ... A8`
- è in riposo compensativo su `A1`
- non è in servizio di sezione su tutti i turni `B*`, `C*`, `D*`

## Punto di riferimento (anchor)

Per ottenere un calcolo riproducibile serve un riferimento iniziale certo:

- `REF_DATE = 2025-01-01`
- `REF_SECTION = A`
- `REF_SKIP = 3`

Interpretazione: il **turno diurno** del `01/01/2025` è `A3`.

> Se in un altro comando/provincia il riferimento è diverso, basta cambiare questi 3 valori.

## Algoritmo di calcolo (turno diurno)

Dato un `date`:

1. Calcola `diffDays = giorni_tra(date, REF_DATE)` (positivo/negativo)
2. Sezione:
   - `sectionIdx = (REF_SECTION_INDEX + diffDays) mod 4`
   - con normalizzazione del modulo per date precedenti
3. Salto:
   - `cycleShift = floor(diffDays / 4)`
   - `skipIdx = (REF_SKIP - 1 + cycleShift) mod 8`
   - `skip = skipIdx + 1`
4. Risultato diurno: `SECTIONS[sectionIdx] + skip`

### Pseudocodice

```txt
SECTIONS = [A, B, C, D]

function dayShift(date):
  diffDays = differenceInCalendarDays(date, REF_DATE)

  sectionIdx = (REF_SECTION_INDEX + diffDays) % 4
  if sectionIdx < 0: sectionIdx += 4

  cycleShift = floor(diffDays / 4)

  skipIdx = (REF_SKIP - 1 + cycleShift) % 8
  if skipIdx < 0: skipIdx += 8

  return { section: SECTIONS[sectionIdx], skip: skipIdx + 1 }
```

## Algoritmo turno notturno

Regola operativa:

```txt
nightShift(date) = dayShift(date - 1 giorno)
```

Quindi il notturno del 10/02 usa il diurno del 09/02.

## Orari tipici (solo visualizzazione)

- **Diurno**: `08:00 -> 20:00`
- **Notturno**: `20:00 -> 08:00`

Nota: gli orari non influenzano il pattern di sezione/salto; servono solo per UI/report.

## Gestione date: raccomandazione importante

Per evitare bug timezone:
- Usa chiavi data locali `YYYY-MM-DD` (non UTC con `toISOString()` per le chiavi business)
- Parsea `YYYY-MM-DD` in locale (`new Date(y, m-1, d)`)
- Mantieni una utility unica per `toDateKey()` e `parseDateKey()`

## Validazione minima del pattern

Test consigliati:
1. `dayShift(2025-01-01) = A3`
2. `dayShift(2025-01-02) = B3`
3. `dayShift(2025-01-05) = A4` (salto +1 ogni 4 giorni)
4. `nightShift(2025-01-02) = dayShift(2025-01-01) = A3`
5. Date precedenti al riferimento (es. `2024-12-31`) devono funzionare correttamente

## Struttura consigliata in una app turnario

- `utils/turni.ts`
  - `getDayShift(date)`
  - `getNightShift(date)`
  - `formatShift({section, skip})`
- `utils/dateKey.ts`
  - `toDateKey(date)`
  - `parseDateKey(dateKey)`
- `components/Calendar`
  - calcolo giornaliero diurno/notturno
  - evidenziazione del turno utente (`A1..D8`)

---

Se devi ricreare una nuova app, ti basta mantenere:
1) un anchor affidabile, 2) modulo corretto su indici, 3) gestione date locale coerente.
