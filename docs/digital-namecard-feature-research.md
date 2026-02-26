# Digital Name Card — Feature Research

> Research date: February 2026
> Purpose: Explore features available in the digital business card market to inform future phases of the CBNC project.

---

## Current CBNC Scope (Phase 1 — Reference)

| Category | Features |
|---|---|
| Profile & Auth | Registration, login, logout, reset password |
| Content | Employee profile editing (multilingual: th/en/zh) |
| Sharing | Public profile link, QR code generation |
| Exports | PDF export, JPG export |
| Admin | User list, activate/deactivate |
| Platform | Responsive web (desktop + mobile) |

---

## Feature Summary Table

All features observed across major digital name card platforms, grouped by category.

### 🔗 Sharing Methods

| Feature | Description | Phase Idea |
|---|---|---|
| Public link / URL | Stable shareable URL for the profile | ✅ In Phase 1 |
| QR code | Static or dynamic QR pointing to profile | ✅ In Phase 1 |
| NFC tap (static link) | Physical NFC card with a fixed URL — tap to open profile on mobile | 💡 Your idea |
| Apple Wallet card | Add card to iOS Wallet app; share by double-tap or NFC | 💡 Your idea |
| Google Wallet card | Add card to Android Wallet; share via tap or widget | 💡 Your idea |
| Email sharing | Send card link via email | Easy add |
| SMS / messaging | Share link over SMS, iMessage, WhatsApp | Easy add |
| AirDrop | Share contact to nearby Apple device | iOS-specific |
| Social media sharing | Share link via social platforms | Easy add |
| Apple Watch widget | Show QR from wrist | Advanced |
| Lock screen widget | Card or QR accessible from phone lock screen | Advanced |
| Siri integration | Open card via voice command | Advanced |
| NameDrop (Apple) | Tap two iPhones together to exchange cards | Requires native app |

---

### 👤 Profile Content

| Feature | Description | Notes |
|---|---|---|
| Name, job title, company | Core contact identity | ✅ In Phase 1 |
| Photo / avatar | Profile or company photo | ✅ In Phase 1 |
| Email, phone, address | Contact fields | ✅ In Phase 1 |
| Multilingual fields | Content in multiple languages | ✅ In Phase 1 |
| Social media links | LinkedIn, Twitter/X, Facebook, Instagram, etc. | Easy add |
| Bio / description | Free-text personal or professional summary | Easy add |
| Embedded video | Intro video or company reel | Medium effort |
| PDF / documents | Attach brochure, resume, portfolio | Medium effort |
| Custom external links | Flexible links (portfolio, booking, website) | Easy add |
| Payment info | PayPal, PromptPay, etc. | Optional |
| Custom CTAs | Call-to-action buttons (e.g., "Book a Meeting") | Medium effort |
| Company logo | Separate logo field for branding | Easy add |

---

### 🎨 Card Customization

| Feature | Description | Notes |
|---|---|---|
| Card color / theme | User-selectable color palette | Easy add |
| Company branding | Enforce brand colors, logo, fonts for a team | Admin feature |
| Custom templates | Department or role-specific card layouts | Medium effort |
| Branded QR code | QR with logo overlay and custom colors | Medium effort |
| Custom subdomain / slug | e.g., `cards.company.com/john` | Infra change |
| Profile background image | Banner or background photo | Medium effort |

---

### 📊 Analytics & Tracking

| Feature | Description | Notes |
|---|---|---|
| View count | Number of times the public card was viewed | Easy add |
| Tap / scan count | How many times QR or NFC was triggered | Medium effort |
| Link click tracking | Which links on the card were clicked | Medium effort |
| Real-time analytics | Live view of activity | Medium effort |
| Location of scans | Geographic breakdown of views | Advanced |
| Conversion tracking | Did viewer save contact / submit lead form | Advanced |
| Lead scoring | Score leads by engagement or profile match | Advanced |
| Performance dashboard | Aggregate team-level analytics | Advanced |

---

### 📥 Lead Capture

| Feature | Description | Notes |
|---|---|---|
| Two-way contact exchange | Viewer can submit their contact back | Medium effort |
| Lead capture form | Custom form attached to card (name, email, etc.) | Medium effort |
| Qualifying questions | Form with structured fields (role, company size, interest) | Advanced |
| Paper card scanner (OCR) | Scan a physical business card to create a digital contact | Advanced |
| AI lead enrichment | Auto-fill company/title info from name or email | Advanced |

---

### 📤 Export & Save

| Feature | Description | Notes |
|---|---|---|
| PDF export | Download card as PDF | ✅ In Phase 1 |
| JPG / PNG export | Download card as image | ✅ In Phase 1 |
| .vcf / vCard file | Standard contact file for direct import to phone | Easy add |
| Add to Apple Contacts | One-tap save contact to iOS | Requires vCard |
| Add to Google Contacts | One-tap save contact to Android | Requires vCard / intent |
| Email signature block | Generate HTML snippet to embed in email | Medium effort |

---

### 🔗 Integrations

| Feature | Description | Notes |
|---|---|---|
| CRM sync (HubSpot, Salesforce, etc.) | Push captured contacts to CRM | Enterprise feature |
| Zapier / webhook | Automation for any workflow | Enterprise feature |
| Google Workspace integration | Auto-populate email signatures | Enterprise feature |
| Microsoft 365 integration | Email signature deployment | Enterprise feature |
| HR / Active Directory sync | Auto-provision cards from HR system | Enterprise feature |
| SSO (SAML / OIDC) | Enterprise identity login | Explicitly out of Phase 1 |
| Slack / Teams notification | Alert when card is viewed or contact captured | Enterprise feature |

---

### 👥 Team & Admin Features

| Feature | Description | Notes |
|---|---|---|
| Admin user management | Activate/deactivate users | ✅ In Phase 1 |
| Team branding enforcement | Lock brand fields so employees can't override | Medium effort |
| Department-level templates | Different templates per team or role | Advanced |
| Bulk user import | CSV / Excel upload to create multiple accounts | Enterprise feature |
| Team analytics dashboard | See aggregate performance across all employees | Advanced |
| Policy enforcement | Restrict which fields can be edited | Advanced |
| Dedicated account manager | Human support for large enterprise | Non-technical |

---

### 🔒 Security & Compliance

| Feature | Description | Notes |
|---|---|---|
| Session cookie auth | Standard auth for private routes | ✅ In Phase 1 |
| Offline mode | Card viewable without internet (cached) | Medium effort |
| GDPR / PDPA compliance | Data handling policies | Governance |
| SOC 2 compliance | Enterprise security certification | Long-term |
| AES-256 encryption | Encrypted offline data storage | Advanced |
| Privacy controls per field | User can hide individual fields | Out of Phase 1 |

---

## Detailed Feature Descriptions

### 1. NFC Tap (Static Link)

Physical NFC cards embed a static URL pointing to the digital profile. When tapped against a smartphone, the phone's browser opens the profile page — no app required on the receiver's side.

**How it works:** An NFC chip is embedded in a card, sticker, keychain, or badge. The chip stores the card's public URL (e.g., `https://cards.company.com/public/abc123`). Tapping activates the phone's NFC reader and opens the link.

**Products with this feature:**
- **Popl** — Offers NFC stickers, keychains, wristbands, and badges. App not required for receiver.
- **Dot (dot.cards)** — Black NFC card; one-time purchase with free lifetime profile updates.
- **V1CE** — Premium physical cards in metal, bamboo, and standard formats. Includes free professional design.
- **Mobilo** — "Classic tap card" with multiple sharing modes.
- **HiHello** — Compatible with any external NFC tag (no branded hardware sold).
- **Blinq** — Supports NFC sharing; no branded physical card.

**Key design consideration:** The NFC link should be the same stable `public_id` URL already in Phase 1. The NFC chip is external hardware — the software changes needed are zero (just print/encode the URL). Phase 2 may consider selling or issuing branded physical cards.

---

### 2. Apple Wallet / Google Wallet Card

The digital card is packaged as a Wallet Pass — a `.pkpass` file (Apple) or a Google Wallet object. The user adds it to their phone's native Wallet app and can share it by tapping their phone to another (or showing the QR from the Wallet).

**How it works:**
- **Apple Wallet:** Generate a `.pkpass` package (JSON + images signed with an Apple Certificate). Served as a download link or QR scan. Stored in iOS Wallet. Supports NFC sharing on iPhone (Wallet passes can be NFC-enabled for tap-to-share scenarios).
- **Google Wallet:** Uses the Google Wallet API to issue a Generic Pass object. Linked via a save URL. Android device stores and displays it natively.

**Products with this feature:**
- **HiHello** — Both Apple and Google Wallet; accessible from lock screen widget.
- **Blinq** — Both wallets; card accessible by double-tapping phone (iOS) or widget.
- **Wave Connect** — Both wallets; works offline via cached pass.
- **Uniqode** — Both wallets; supports two-way contact exchange.
- **Spreadly** — Both wallets; includes automatic lead enrichment.
- **Lynkle** — Both wallets; unlimited fields.
- **Yohn.io** — Free tool specifically for generating Wallet cards.
- **PassKit** — Platform dedicated to Apple/Google Wallet pass creation.

**Technical notes:**
- Apple Wallet requires an Apple Developer account and signing certificate.
- Google Wallet API requires a Google Cloud project and service account.
- Both passes can contain a QR code pointing to the profile URL.
- Passes can be updated remotely (push an update to change contact info without re-issuing).
- Updateable passes are a key advantage over static NFC links.

---

### 3. Two-Way Contact Exchange

When a viewer opens the card, they are invited to share their own contact info back. This turns a one-way broadcast into a mutual exchange.

**How it works:** A lead capture form appears on the public card page. The viewer fills in their name, email, and phone. The data is stored and made accessible to the cardholder (in their dashboard).

**Products with this feature:**
- **Wave Connect** — Two-way exchange with direct CRM sync.
- **Mobilo** — Exchange enabled; lead data enriched with company intelligence.
- **Uniqode** — Two-way sharing with view/save analytics.
- **Popl** — Lead capture with qualifying questions and AI enrichment.
- **Blinq** — Exchange with Relationship Intelligence suggestions.

---

### 4. Analytics & Tap Tracking

Track how often and where a card is viewed, scanned, or tapped.

**Products with this feature:**
- **Mobilo** — Most comprehensive: view count, link clicks, tap tracking, lead scoring, location, conversion.
- **Blinq** — Team-level analytics; AI-powered lead scoring.
- **Popl** — Event-focused analytics; badge and card scan tracking.
- **Haystack** — Activation, views, and share tracking; activity insights per employee.
- **Inigo** — Real-time views and link click tracking; performance dashboard.
- **Wave Connect** — Real-time tap and contact capture analytics.

---

### 5. vCard (.vcf) Export & One-Tap Contact Save

A `.vcf` (vCard) file lets a viewer save the cardholder's contact directly to their phone's address book — no manual typing.

**How it works:** A "Save Contact" button triggers a `.vcf` download. On iOS and Android, opening a `.vcf` file prompts the user to add it to Contacts. This is the most standard and universally supported method.

**Products with this feature:**
- Nearly all platforms include vCard export as a baseline feature (HiHello, Blinq, Popl, Dot, V1CE, Mobilo, Wave, Uniqode).

**CBNC relevance:** This is a high-value, low-effort add-on for Phase 2. The server already has all profile data; generating a `.vcf` response is a few lines of code.

---

### 6. Email Signature Generator

Produces an HTML snippet the user can paste into Gmail, Outlook, or Apple Mail settings — their email footer becomes a mini business card with photo, title, links, and a QR code.

**Products with this feature:**
- **HiHello** — Deep integration with Google Workspace and Microsoft 365 (auto-deploy to all employees).
- **Blinq** — Free generator; QR in signature.
- **Tapni (MailSign)** — Free customizable templates.
- **Wave Connect** — Generator with QR code option.
- **V1CE** — Generator with QR code option.
- **Haystack** — For teams with HR sync.

---

### 7. Paper Business Card Scanner (OCR)

Users can scan a physical paper card using their phone camera. AI/OCR extracts the contact fields and creates a digital contact.

**Products with this feature:**
- **Popl** — 95% enrichment accuracy; supports badge scanning at events.
- **Haystack** — Multilingual OCR (all languages).
- **Tapni** — AI card scanner.
- **Inigo** — In-app paper card scanner.
- **ShareECard** — Advanced OCR with multi-language support.
- **CloudCard** — AI-powered lead capture from paper cards.

---

### 8. CRM Integration

Push contact data captured from the card to a CRM system automatically.

**Products with this feature:**
- **Wave Connect** — Native API integrations (not Zapier) with HubSpot, Salesforce, Zoho, Pipedrive. Two-way real-time sync.
- **Blinq** — Salesforce, HubSpot, Zapier, Microsoft, Google. AI enrichment before sync.
- **V1CE** — HubSpot, Salesforce, Pipedrive.
- **Inigo** — Capsule, FullContact, HubSpot, Insightly, Pipedrive, Zoho CRM.
- **Mobilo** — Salesforce, HubSpot with lead scoring.

---

### 9. Company / Team Branding

Enforce consistent branding across all employee cards: company logo, colors, approved fonts, locked fields.

**Products with this feature:**
- **Haystack** — Team branded templates with images, videos, and social links.
- **Blinq** — Policy enforcement; prevents individual employees from overriding brand settings.
- **Wave Connect** — Team admin controls with bulk Excel import for deployment.
- **Inigo** — Custom templates per department or product line.
- **Mobilo** — Multiple card modes (Card / Landing Page / Lead Gen / Direct Link) at team level.

---

### 10. Offline Mode

Card remains shareable (via QR or NFC) even without an active internet connection.

**Products with this feature:**
- **HiHello** — Offline mode with auto-sync on reconnect.
- **Wave Connect** — Cached QR for offline sharing; NFC works offline.
- **Blinq** — Double-tap to access offline.
- **Popl** — Offline sync with AES-256 encryption; badge scanning queue.

---

## Products Reference

| Product | Website | Key Strength |
|---|---|---|
| HiHello | hihello.com | Offline mode, email signature, Apple Watch |
| Blinq | blinq.me | AI Relationship Intelligence, #1 G2 2026 |
| Popl | popl.co | NFC hardware, AI badge scanning, events |
| Dot (dot.cards) | dot.cards | One-time purchase, free lifetime updates |
| V1CE | v1ce.co | Premium NFC materials (metal/bamboo) |
| Mobilo | mobilocard.com | Lead scoring, multiple sharing modes |
| Haystack | thehaystackapp.com | HR/AD sync, multilingual OCR |
| Inigo | inigoapp.com | Dept-level templates, CSV export |
| Wave Connect | wavecnct.com | SOC 2, native CRM sync, two-way exchange |
| Uniqode | uniqode.com | Dynamic QR, two-way exchange, wallet |
| ShareECard | shareecard.com | Swiss data residency, free premium |
| Spreadly | spreadly.app | Lead enrichment, wallet, custom forms |
| PassKit | passkit.com | Apple/Google Wallet platform |
| Yohn.io | yohn.io | Free wallet card generator |
| Tapni | tapni.com | AI scanner, MailSign email signature |

---

## Suggested Roadmap Mapping

| Phase | Features to Consider |
|---|---|
| **Phase 1 (current)** | Public link, QR code, PDF/JPG export, multilingual, admin |
| **Phase 2 (next)** | vCard (.vcf) save contact, social links, bio field, view analytics, NFC static link (hardware only) |
| **Phase 3** | Apple Wallet / Google Wallet pass, two-way contact exchange / lead capture form, email signature generator |
| **Phase 4** | CRM integration (HubSpot/Salesforce), team branding enforcement, bulk user import |
| **Phase 5** | AI lead enrichment, paper card OCR scanner, offline mode, advanced analytics |
