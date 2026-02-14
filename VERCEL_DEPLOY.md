# Deploy på Vercel (demo)

## Snabbaste sättet – demo med mock (ingen backend)

1. **Pusha till GitHub**  
   Om projektet inte redan är ett repo:
   ```bash
   cd "/Users/baltsar/Documents/Cursor/MONEROTOPIA/PAYMENT DASHBOARD UI"
   git init
   git add .
   git commit -m "MoneroPay Dashboard"
   git remote add origin https://github.com/DITT-ANVANDARNAMN/DITT-REPO.git
   git push -u origin main
   ```

2. **Gå till [vercel.com](https://vercel.com)** → Logga in (GitHub).

3. **New Project** → Importera ditt GitHub-repo.

4. **Viktiga inställningar (om du inte kan ändra Root Directory):**
   - **Root Directory:** behåll `./` (repo-roten).
   - **Build Command:** slå på toggle och sätt till `npm run build`.
   - **Output Directory:** slå på toggle och sätt till `frontend/dist`.
   - **Environment Variables:** klicka "Add" och lägg till:
     - Name: `VITE_USE_MOCK`  
     - Value: `true`  
     - Environment: Production (och Preview om du vill).

5. **Deploy** → Vercel bygger och ger dig en URL.

Demo-versionen kör då med mock: synk, balance och betalningar är simulerade. Inget MoneroPay eller monerod behövs.

---

## Om du senare vill använda riktig API

- Hosta MoneroPay + nod någonstans (t.ex. egen server eller annan hosting).
- I Vercel, lägg in:
  - `VITE_USE_MOCK` = `false`
  - `VITE_MONEROPAY_URL` = `https://din-moneropay-url.com/api`
  - `VITE_NODE_RPC_URL` = `https://din-moneropay-url.com/node` (om du exponerar node-RPC)
  - `VITE_NODE_MODE` = `remote`
- Bygg om (redeploy) så att nya env-värden bakar in i klienten.
