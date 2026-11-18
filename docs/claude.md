# Claude at $0.00

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

Read this first, because it is the one people get wrong: **Anthropic has no free API tier.** The Claude API is
prepaid credits only. Nothing in this repo will produce a free Claude API key, and nothing legitimate will.

What is free is the assistant, and Claude models reached through other companies products.

## 1. The assistant — claude.ai free plan

Sign up with an email or Google account, no card. You get the current Claude models with a message allowance that
resets on a rolling window, plus file and image upload. Usage limits are shown in the product itself.

This is the honest answer to "how do I use Claude for free": use the free plan, and let the limits be the limits.

## 2. Claude inside an editor you already have

Claude models are selectable in several products that have their own free tiers:

| Product | Free access to Claude models | Card |
| --- | --- | --- |
| GitHub Copilot Free | yes, Claude and GPT models in the model picker, monthly chat allowance | no |
| Copilot Chat in github.com | yes, same allowance | no |
| Vendor IDE free tiers | varies by month and region — check the model picker before relying on it | no |

GitHub Copilot Free is the most stable of these and is the recommended path for editor-side Claude without paying.
It is not the API: you cannot call it from your own scripts, and automated use is against its terms.

## 3. Education and organisation plans

- Claude for Education: universities deploy it for their students; availability is decided by your institution.
- Team/Enterprise seats: if your employer already pays, the marginal cost to you is $0.00 — ask before buying.

## 4. Claude in code, paid for by credits

If you need the actual API — because you are building something — the money comes from a credit program, not from
Anthropic directly. Claude is served on Bedrock and on Vertex AI, so cloud credits work:

- AWS Activate credits → Bedrock → Claude
- Google for Startups credits → Vertex AI → Claude
- Microsoft for Startups / Azure credits → Claude in Foundry

Details and current program shapes: [dev-programs.md](dev-programs.md). These are credits, not free service: they
run out, they expire, and some programs require a company.

## What does not exist

- A free Anthropic API key. If a page offers one, it is stolen or it is a proxy that reads your prompts.
- A "Claude Pro for free" generator. Same category as the [rooted-phone scripts](faq.md#why-not-the-rooted-phone-scripts).
- Unlimited Claude via a reverse-engineered claude.ai endpoint. That is a cookie-stealing service with a UI.

## The pragmatic answer

Use claude.ai free for the hard thinking, Copilot Free for editor work, and a local model for anything bulk or
private. If you need programmatic Claude, budget for credits and fund them through a program — do not look for a
free key, because there is no such thing.