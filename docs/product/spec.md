# Spec: CloakScan v1 (Chrome, manual scan)

> Copied from the CloakScan business plan (`Business-Plans/cloakscan/build/spec.md` in the private pipeline workspace) on 2026-09-27. This copy is the one the roadmap works from.

**Decision it serves:** the plan's decision memo (private) · **Status:** draft
**The bet being tested:** whether the org's own distribution channel can get this tool past the ~23-install floor two prior identical attempts stalled at (`analysis/business-case.md`).

## Users & jobs

- **The primary user** — a developer or AI/automation practitioner who routinely hands a page to an agentic browser (Comet), a Chrome-based AI assistant (Claude, ChatGPT), or pastes page content into a chatbot, and wants to know before they do whether the page contains text meant for the agent and hidden from them. Job traced to `analysis/market-scan.md`'s named incidents (Comet, ShadowPrompt) — an observed attack pattern, not an invented persona.
- **The secondary user** (Should, not Must for v1) — a content/marketing team auditing their own published pages for hidden text slipped in by a compromised CMS plugin or a comment section, per the source idea's B2B angle. Not validated by any interview; tagged `[assum]`.

## In scope (this version)

### Must

- **Manual page scan** — As a practitioner, I want to click the toolbar icon and scan the current tab, so that I know before handing this page to an agent whether it contains hidden instructions.
  - AC: Given a page with a planted white-on-white span, an off-screen-positioned div, an HTML comment, and a zero-width-character string, When I click Scan, Then all four are listed with plain-language descriptions and outlined on the page within 2 seconds on a typical article-length page.
- **Six-heuristic detection** — color-matched text, off-screen positioning, shrunk-to-invisible font sizing, aria-hidden elements carrying instruction-like phrasing, HTML comments, zero-width Unicode characters. Carried over unchanged from the prototype; this is table stakes against the existing competitor, not a differentiator (`analysis/teardown-ai-prompt-injection-scanner.md`).
  - AC: Given the prototype's own demo article (one planted example per technique), When scanned, Then all six are detected with zero false negatives on that fixture.
- **Copy visible-only text** — As a practitioner, I want a button that strips flagged content and copies the rest, so that I can safely hand a cleaned version of the page to a chatbot.
  - AC: Given a scan has run, When I click "copy visible-only text," Then the clipboard contains the page's visible text with every flagged span removed.
- **Minimal permissions** — `activeTab` + `scripting` + `storage` only, no `host_permissions`, no `<all_urls>`. Carried over from the prototype because it's a real trust signal for a security-conscious audience, not incidental.
  - AC: Given the packaged extension's manifest, When inspected, Then it declares no permission beyond the three above.
- **Public, listed release** — the extension is submitted to the Chrome Web Store under the org's developer account, not left as a load-unpacked-only prototype, since the entire bet in the decision memo is on distribution reach.
  - AC: Given the repo is tagged v1.0, When checked, Then the listing is live and linked from the repo README and the org's front door.

### Should

- Firefox-compatible build (from the prototype's own roadmap).
- A shareable "page hygiene" report link for the B2B audit use case.

### Could

- Continuous background scanning (the source idea's proposed paid tier) — cheap to defer; nothing in v1 blocks adding it later.
- Cross-device scan history sync.

## Explicitly out of scope (Won't, this version)

- **Screenshot-based hidden-instruction detection** (the follow-on Brave research, `research/brave-unseeable-screenshots.md`) — a materially different detection surface (rendered pixels, not DOM) requiring different techniques entirely. Would roughly double the MVP's scope for a risk class with one research disclosure and no confirmed in-the-wild incident yet.
- **"Pause the agent when this page scores high risk"** — the source idea itself names this aspirational, since no agentic browser currently exposes a hook letting a third-party extension halt its action queue. Revisit if/when such an API exists.
- **Continuous/automatic scanning** and **paid tier of any kind** — the business case shows monetization is immaterial at any realistic year-one scale (`analysis/business-case.md`); building it now would spend agent-weeks on a feature with no evidence anyone will pay for it yet.
- **Any language other than English heuristics** — the six detectors are structural (position, color, size, character class) except the aria-hidden "instruction-like phrasing" check, which is English-only for v1. Written down so it doesn't get silently reintroduced as a requirement in week three.

## Non-functional requirements

- **Scan latency:** completes within 2s on a typical article-length page (under ~5,000 DOM nodes) `[assum: reasonable for a manual, on-demand action; no user complaint data exists yet]`.
- **Manifest V3 compliant** — required for Chrome Web Store listing as of 2026; no MV2 fallback.
- **No network calls from the extension itself** — every heuristic runs against the DOM already in the tab; nothing phones home. This is both a privacy requirement and the only way to honestly claim the "no host_permissions, no standing access" trust story from the Must list above.
- **Demo works from `file://` with no server**, carried over from the prototype, since the org's release model is a static GitHub Pages demo.

## Open questions

- **Decided 2026-10-16 in [ADR-003](../decisions/adr-003-instruction-phrasing.md): word-bounded patterns that need a model addressee or an override.** Should the aria-hidden "instruction-like phrasing" heuristic use a fixed keyword list (current prototype approach) or something more robust? The source idea's own roadmap flags the current list as "hand-written," not built from real cases. Owner: whoever picks up the first weekly increment; decide by the second build slice, since the third-party keyword list is also where a determined attacker would first try to evade detection.
- Which launch channel (Show HN, dev.to, r/artificial, or just the org front door) gets tried first, and when — the decision memo's falsifier (100 installs by 2027-03-22) only means something if a real launch attempt actually happens. Owner: Mike, decide before the repo goes public.
