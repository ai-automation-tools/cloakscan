# Security policy

CloakScan is a Chrome extension that reads the page you're on when you click it. It holds
three permissions (`activeTab`, `scripting`, `storage`) and makes no network requests. A
bug that breaks either of those promises is a security bug, and so is one that lets a page
hide text from the scan on purpose.

## Reporting a vulnerability

Report it privately through GitHub's security advisories: open the repository's
**Security** tab and click **Report a vulnerability**
(`https://github.com/ai-automation-tools/cloakscan/security/advisories/new`). Please don't
open a public issue for it.

Say what you found, the page or steps that show it, and the Chrome version you saw it on.
You'll get a reply within a week. Once a fix ships, the advisory is published with credit
to you unless you'd rather stay anonymous.

## What counts

- The extension sending anything off the device, or loading remote code.
- The extension gaining access to a tab without a click on its toolbar icon.
- A page script reading or changing what CloakScan stores in `chrome.storage.local`.
- Markup that hides text from a person and from all six checks in a way the docs don't
  already list as a known miss. Known misses are in
  [ADR-003](docs/decisions/adr-003-instruction-phrasing.md).

A plain false positive or false negative on an ordinary page is a bug, not a
vulnerability. Open a normal issue for those.

## Supported versions

Only the latest release gets fixes.
