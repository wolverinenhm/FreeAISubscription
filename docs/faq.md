# FAQ, myths, and the scams

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

## Can I get Gemini Ultra, Claude Pro or ChatGPT Plus for $0.00?

No. They are paid plans. The free products each company offers are different things with different limits — they are
documented in [gemini.md](gemini.md), [claude.md](claude.md) and [chatgpt.md](chatgpt.md) — and they are free forever,
which the paid plans are not.

If you are reading this because a repo promised otherwise, the next answer is the one you need.

## Why not the rooted-phone scripts?

There is a well-circulated category of repo that walks a rooted Android phone through a free subscription and posts
instructions with a group-chat QR code. The mechanics are always some version of: instrument the app, call a billing
library directly, activate a trial offer the store would never have shown you, and do it again from a list of
accounts. Some of them take account files in `email----password----2fa` format.

It fails on four counts, in ascending order of how much it will cost you:

1. **It violates the terms you agreed to.** The account goes, along with anything attached to it.
2. **It is fraud, not a loophole.** Activating a 0-price offer you were not offered is deception to obtain a paid
   service. That holds in every jurisdiction these services operate in.
3. **The account files are someone else accounts.** A script that consumes credential lists is an account farm.
   Running it makes you the operator.
4. **The funnel is the point.** A group chat with a QR code exists to collect people who will run unvetted code and
   hand over credentials. Whatever is in the second half of that group, it is not support.

This repo exists partly as the boring alternative: everything in it can be done with a browser, an email address,
and no card.

## Are free trials with a card really $0.00?

Yes — if you cancel before renewal, and yes, the card is the risk. A trial that forgets to remind you is a
subscription with a delay. If you take one, put the cancellation date in your calendar the same minute you sign up.
The no-card free tiers in this repo have no such failure mode, which is why they are the default recommendation.

## Someone is selling "unlimited API access" for $2/month. Is it real?

It is real in the sense that calls work, and fake in every way that matters. Behind those services is a pool of
stolen keys, leaked cookies, or trial accounts created in bulk. Your prompts go through a stranger process, the
service disappears with your data, and the key can be traced back to you. There is no cheap version of an expensive
thing; there is only someone else paying, or someone else being robbed.

## Will using free tiers get my account banned?

Staying inside published limits, no — that is what the free tier is for. Getting banned is what happens when you
script around limits: rotating accounts to dodge a per-account quota is exactly the behaviour the limits exist to
detect. If you need more than a free tier gives, the honest options are credits or a local model, not more accounts.

## Which backend should I actually use?

Start with whichever you already have an account for, then add one more so the router has somewhere to fall back to.
Gemini first for quota, Groq first for speed, Ollama first for privacy. The chain order is a one-line change.

## Does this repo store or transmit my keys?

No. Keys are read from `.env`, which is gitignored, and used only in the request header to the provider you chose.
There is no proxy, no relay, no telemetry, no analytics endpoint. Read `src/router.js` — it is short, and that is
deliberate.

## The docs say something that is no longer true.

That is expected and worth fixing: every page carries a review date, and free tiers move faster than most repos.
A PR that updates the registry and the page together is the most useful contribution you can make here.