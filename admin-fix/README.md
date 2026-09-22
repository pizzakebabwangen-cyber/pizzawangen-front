# Admin-Fix: Menü-Rabatt + DiscountCode

## Problem
- Admin zeigt `Wangen15` als Aktiv=Ja
- `GET /api/Cart/active-menu-offer` liefert `{ "active": false }`
- Menü zeigt keine Karte; Rabattcode greift oft nicht

## Front (dieses Repo) – bereits gefixt
1. Checkout sendet Rabattcode **nur** als `discountCode` (nicht mehr doppelt als `gutscheinCode`)
2. Menü-Karte akzeptiert camelCase/PascalCase vom API

## Admin (WangenPizza) – du musst das deployen
1. Öffne `CartController` (Action `ActiveMenuOffer` / Route `active-menu-offer`)
2. Ersetze die Logik mit dem Code in `ActiveMenuOffer.cs.example`
3. Beim Speichern der Bonusnummer: `ShowOnMenu` + `IsActive` + `ExpiryDate` korrekt setzen
4. Publish + Upload Admin
5. Test: `https://admin.pizzawangen.ch/api/Cart/active-menu-offer`
   → muss `active:true` + `code:"Wangen15"` liefern
