# Build plan: CloakScan v1

> Copied from the CloakScan business plan (`Business-Plans/cloakscan/build/build-plan.md` in the private pipeline workspace) on 2026-09-27. The ADRs and estimate it cites stay in the private plan; `CLAUDE.md` summarizes both ADRs.

**Spec:** [spec.md](spec.md) · **Architecture:** ADR-001 (org Chrome Web Store account) and ADR-002 (no telemetry), private · **Estimate:** private

The prototype already has a walking skeleton — a working unpacked extension plus a server-free static demo (`index.html`) that runs the same popup/scan logic. Slicing here is about de-risking the distribution bet and shipping the trust signals the business case depends on, not about proving the detection logic works; that part is done.

## Slice 0 — Walking skeleton (already exists)

The source prototype: six heuristics, on-page outlining, copy-visible-only-text, `chrome://extensions` load-unpacked flow, and a `file://`-runnable demo. Confirms the end-to-end path from click to annotated page. Nothing to build this slice — carry it forward as-is into the public repo.

## Slice 1 — Harden and test what already works

- **Delivers:** manifest/permissions hardening, icon, packaging polish + test harness for the six heuristics against the fixture page, wired into CI.
- **De-risks:** the "minimal permissions, no host_permissions" trust claim in the spec — this has to be verifiably true (a manifest a reviewer can check), not just asserted. Also de-risks silent regression on the one thing CloakScan has to get right: the detectors actually detecting.
- **Done when:** CI runs the fixture-page test on every push and fails if any of the six planted techniques goes undetected; the packaged manifest declares only `activeTab`, `scripting`, `storage`.

## Slice 2 — Public repo and demo

- **Delivers:** the repo scaffold (README, docs per the org's house style), the GitHub Pages static demo wired to the same code path as the real extension popup.
- **De-risks:** nothing technical — this is the artifact the distribution bet in the decision memo actually needs to exist before any launch attempt can happen.
- **Done when:** the repo is public, the demo loads and runs the scan with no server, and every link the memo and spec reference (source idea, this plan) resolves.

## Slice 3 — Riskiest assumption: the Chrome Web Store listing itself

- **Delivers:** ADR-001's org-account listing, submitted and approved.
- **De-risks:** the biggest unknown this estimate flagged — actual current review-queue time, which `build/estimate.md` couldn't source. Submitting early in the sequence (rather than saving it for last) means the calendar-time unknown starts resolving while slices 4-5 still have work to do in parallel.
- **Done when:** the listing is live and installable by someone who isn't the developer.

## Slice 4 — The actual test of the bet: launch

- **Delivers:** the launch content and front-door listing from the spec's Must list — a real post, not just the listing going live quietly the way both prior competitors' listings did.
- **De-risks:** the decision memo's key assumption directly. This slice is the experiment; everything before it was building the thing to run the experiment on.
- **Done when:** the launch post is published and the front door links to the listing.

## Slice 5 — Post-launch response

- **Delivers:** the bug-fix buffer from `build/estimate.md`, responding to whatever real users' first reports surface.
- **De-risks:** nothing new — this is the standard "the last 10% is real" tax, sized honestly instead of assumed away.
- **Done when:** no open bug reports block normal use; not a fixed scope, bounded by the estimate's time-box.

## Definition of done

Every Must acceptance criterion in `build/spec.md` passes, including the manifest-permission check and the fixture-page detection check; CI is green; the extension is installable from a live, listed Chrome Web Store entry; the demo is deployed and reachable, not just merged; nothing the extension does makes a network call (verified by inspection, not just asserted).

## Cut list (if the estimate runs over)

**Could** cut first: the Should items were already deferred out of v1 entirely (Firefox build, B2B report link) — nothing left to trim there. If slice 1's test harness or slice 5's bug-fix buffer runs long, the Could-level cut is scope inside those slices (e.g., ship with fixture-page coverage for the four techniques from the source idea's original examples and add the remaining two as a fast-follow) rather than skipping testing altogether — the Must-level detection-quality bar is defended.

## What we learn, and when we'd stop

The earliest point CloakScan tests the memo's actual bet is **slice 4** — before that, nothing built has any bearing on whether distribution works, because nothing built has been shown to anyone yet. From the decision memo: **if installs are still under 100 by 2027-03-22 despite a real launch attempt, the distribution assumption is wrong and CloakScan moves to `rejected` in the pipeline ledger.** That date is roughly five months after a launch in the estimate's implied late-October/early-November 2026 window — enough time for a launch-driven spike to either happen or visibly not happen, without the org holding onto a dead listing indefinitely on hope.
