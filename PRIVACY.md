# Privacy policy

CloakScan, a Chrome extension published by ai-automation-tools. Last updated 2026-10-22.

## What it collects

Nothing. CloakScan has no account, no analytics, no crash reporting and no update check.
It never sends data to ai-automation-tools or to anyone else.

## What it reads

When you click the CloakScan icon and then **Scan this page**, it reads the page in the tab
you're on, once, to look for hidden text. Chrome's `activeTab` permission limits this to
that one tab, at that moment. It doesn't run on any other tab, in the background, or on its
own.

## What it stores

The result of the last scan (the findings, the page's visible text, and the time of the
scan) in `chrome.storage.local`, so the popup can show it again when you reopen it. That
storage stays on your device. The next scan replaces it, and removing the extension
deletes it.

## What it sends anywhere

Nothing. The extension makes no network requests. When you click **Copy visible-only
text**, the text goes to your clipboard and nowhere else; what you paste it into is up to
you.

## Changes

If this policy changes, the new version replaces this file and its date changes. The
history is in this repository's commits.

## Contact

Questions go to the repository's issue tracker:
`https://github.com/ai-automation-tools/cloakscan/issues`.
