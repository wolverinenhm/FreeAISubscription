# Gemini at $0.00

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

You get Gemini free in three separate places. They are different products with different limits, and all three need
no payment method.

## 1. The app — gemini.google.com, Android, iOS

Sign in with a Google account. That is the whole setup. The free tier gives you the current Flash-class model with
usage caps that reset on a rolling window, plus image and file upload.

This is the closest thing to "ChatGPT but free", and for most people it is enough on its own.

## 2. The API — AI Studio

- Key: <https://aistudio.google.com/apikey> (no card, no billing account)
- Env var this repo reads: `GEMINI_API_KEY` (or `GOOGLE_API_KEY`)
- Free tier limits are expressed as requests per minute, tokens per minute and requests per day, **per model**
- The free tier is not a trial: it does not expire and does not need a card. It is rate limited instead.

The router talks to the OpenAI-compatible surface of that API:

```text
https://generativelanguage.googleapis.com/v1beta/openai/chat/completions
```

```bash
echo "GEMINI_API_KEY=your-key" >> .env
node src/cli.js ask "hello" --provider gemini
```

Model names move faster than repos do. Set `GEMINI_MODEL` rather than editing code:

```bash
GEMINI_MODEL=gemini-2.0-flash-lite node src/cli.js ask "cheap question" --provider gemini
```

Note that when you enable billing on that Cloud project, the same key silently becomes pay-as-you-go. Free tier
versus paid is a property of the project, not of the key. Check <https://aistudio.google.com/usage>.

## 3. Gemini CLI

`npm install -g @google/gemini-cli`, then log in with a personal Google account. It authenticates through a free
OAuth flow that grants a daily request allowance without a key. Reaching for an API key is only needed when you want
the CLI to use a specific project.

## Promotions that are real, and worth checking

| Offer | Real? | The catch |
| --- | --- | --- |
| Google AI Pro free for students, eligible countries | yes | needs student verification, renews yearly while eligible |
| Regional carrier / device bundles (e.g. some telco plans) | yes | tied to the carrier plan, region-locked |
| Google One AI Premium 1-month free trial | yes | a card **is** required; $0.00 only if you cancel before renewal |
| "Gemini Ultra for $0 via billing hook" | **no** | fraud — see [faq.md](faq.md#why-not-the-rooted-phone-scripts) |

The one-month trial is a legitimate offer and it really does cost $0.00 — but it is a reminder-shaped $0.00. Set a
calendar entry for two days before the renewal date, or skip it. The free tier has no such trap.

## What is not possible

- Gemini Ultra / AI Ultra without paying, or without an eligible promo. The plan exists; it costs money.
- Turning a free API key into an unlimited one. Caps are enforced server-side per project.
- "Gemini Pro cookies" sold in group chats: those are someone else session cookies. Using them is account takeover.

## Recommended setup

1. Free app for chat, on whatever device is at hand.
2. An AI Studio key in `.env` for scripts — this is the one the router uses.
3. Gemini CLI if you want an agent in the terminal.
4. Only then consider a promo, and only if you will actually use the paid features.