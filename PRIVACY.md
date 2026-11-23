# Privacy policy

CloakScan, a Chrome extension published by ai-automation-tools. Last updated 2026-11-17.

## What it collects

Nothing. CloakScan has no account, no analytics, no crash reporting and no update check.
It never sends data to ai-automation-tools or to anyone else.

## What it reads

When you click the CloakScan icon and then **Scan this page**, it reads the page in the tab
you're on, once, to look for hidden text. Chrome's `activeTab` permission limits this to
that one tab, at that moment. It doesn't run on any other tab, in the background, or on its
own.

## What it stores

A short record of the last scan, so the popup can show it again when you reopen it on the
same tab: the page's address, the time of the scan, and each finding's type with the first
60 characters of its hidden text. It keeps none of the page's visible text; to copy that
again, scan again. The record sits in `chrome.storage.session`, which Chrome holds in memory
and never writes to disk. Opening the popup on any other tab or page drops it, the next scan
replaces it, and quitting Chrome or removing the extension deletes it.

## What it sends anywhere

Nothing. The extension makes no network requests. When you click **Copy visible-only
text**, the text goes to your clipboard and nowhere else; what you paste it into is up to
you. When you click **Export findings (JSON)**, the findings are saved as a file through
your browser's own download, on your device.

## Changes

If this policy changes, the new version replaces this file and its date changes. The
history is in this repository's commits.

## Contact

Questions go to the repository's issue tracker:
`https://github.com/ai-automation-tools/cloakscan/issues`.
