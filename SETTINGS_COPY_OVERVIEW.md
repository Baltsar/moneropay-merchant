# Settings page — UX copy overview

The Settings page is written for **two readers**:

1. **Merchant (non-technical)** — "I just want to sell stuff for money." They need to understand what they can change (e.g. default currency), what they can’t, and that they’re not missing something. No jargon, no yellow warnings that suggest something is wrong.
2. **Technical / server admin** — Someone who deployed the stack or will edit `.env`. They need to find how to change node mode, zero-conf, or run a backup without digging through docs.

## Approach

- **Lead with plain language.** First line of each card answers: what is this, and can I change it here?
- **No warning styling for “you can’t change this here”.** Use a neutral info style (border + subtle background, Info icon). It’s a fact, not an error.
- **Technical details in “For server admins” `<details>`.** Keeps the main view calm for merchants; admins expand to get env vars and commands.
- **Merchant-first lines where it helps.** e.g. “Back up your wallet so you don’t lose access to your funds” and “The currency you show prices in when receiving or sending.”

## Card-by-card

| Card | Merchant takeaway | Admin takeaway |
|------|-------------------|----------------|
| **Default currency** | “This is the currency I show prices in. I can change it anytime.” | Same; no extra tech. |
| **Node & backend** | “My system is in [local/remote] mode. That was set when it was installed; I can’t change it here. If someone set it up for me, they chose it.” | Expand for `.env` vars and restart command. |
| **Zero-conf** | “Payments are accepted after ~20 min by default. Zero-conf is an optional server setting; I can’t change it here.” | Expand for `MONEROPAY_ZERO_CONF` and risk note. |
| **Wallet backup** | “I should back up my wallet so I don’t lose my funds. Whoever runs the server can do that.” | Expand for volume name and `docker cp` example. |

This keeps the main screen readable for someone who doesn’t know Monero, while the person who edits the server still gets what they need.
