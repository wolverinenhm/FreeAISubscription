# Reading limits instead of memorising them

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

Every free tier is limited. The useful skill is not knowing the numbers — they change — but knowing what shape a
limit takes so you can react to it at runtime.

## The four shapes

| Shape | Looks like | What to do |
| --- | --- | --- |
| Requests per minute | `429` after a quick burst | back off a few seconds, then retry the same backend |
| Tokens per minute | `429` only on long prompts | shorten the prompt or split the work |
| Requests per day | `429` that persists for hours | switch backend for the rest of the day |
| Credit balance | `402` / `insufficient_quota` | that backend is done until the next billing cycle |

The first three are recoverable. The fourth is not, and the router treats both the same way: cool the backend down,
try the next one.

## Why this repo hardcodes no quotas

A quota table in code is wrong within a month and then actively harmful: it skips a backend that is fine, or hammers
one that is not. So the router holds zero numbers and reacts instead:

```js
// src/router.js, the only policy that exists
const COOLDOWN_STATUS = new Set([401, 402, 403, 404, 408, 409, 429, 500, 502, 503, 504, 529]);
// 4xx that means "this backend is unavailable to me" -> skip it for cooldownMs
// 400 means "my request was malformed" -> try the next backend, do not blame it
```

`cooldownMs` defaults to one minute. Raise it if a provider is strict, lower it while debugging.

## Reading a real error

When `freeai ask` fails, it prints every attempt rather than the last one:

```text
All free backends failed -> gemini (429): Resource has been exhausted; groq (network): fetch failed
```

That single line tells you which backend hit a wall, which one could not be reached at all, and which ones were
skipped for lack of a key. `freeai doctor` then tells you what is configured.

If the response carries a `retry-after` header, respect it: it is a promise, not a suggestion, and ignoring it is how
accounts get rate-limit-banned rather than rate-limited.

## A strategy that survives

1. **Cheapest first.** Local model, then the widest free tier, then the rest.
2. **Cheap model for bulk, strong model for hard.** Two different models on the same free key is often the whole
   optimisation: spend the big model on the 10% that needs it.
3. **Cache by prompt hash.** Re-asking the same question is the most common way to waste a free quota.
4. **Degrade, do not fail.** A shorter answer from a smaller model beats an exception in a user-facing product.
5. **Check the billing page monthly.** Free tier versus paid is a property of the account, and one clicked upgrade
   turns a $0.00 project into a bill. This is the only number worth memorising: your own spend.

## When free is not enough

Free tiers are sized for prototyping and personal use. If you need sustained throughput on a frontier model, that is
a legitimate business expense and pretending otherwise will cost you more in downtime than the invoice would:

- [dev-programs.md](dev-programs.md) for credits that pay for it without you paying retail
- [local-models.md](local-models.md) for the workloads that never needed a frontier model