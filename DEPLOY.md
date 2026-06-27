# Deploy (Frontend)

## Einfachste Methode — ein Skript
Rechtsklick auf `deploy-full.ps1` → **Run with PowerShell**

(Oder in PowerShell: `.\deploy-full.ps1`)

---

## Oder manuell

### 1. Build
```powershell
cd "c:\Users\adnan\Desktop\wangen asp\Front\Front"
npm run build
```

### 2. Kopieren
**Gesamten** Inhalt von `dist` nach:
`h:\root\home\wangen2024-001\www\site1\`

### 3. Prüfen
- https://www.pizzawangen.ch öffnen
- Ctrl+U (Seitenquelltext)
- Nach `index-` suchen — aktuelle Datei z. B. `index-B98iNMas.js`
- Wenn eine alte Datei erscheint (z. B. `index-D-VFmueI.js`) = Kopie fehlgeschlagen oder falscher Pfad

### 4. Cache
- Mobil: Browser-Einstellungen → Cache leeren
- Oder privates Fenster verwenden
