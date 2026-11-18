# Free AI Stack

**Gemini, Claude and ChatGPT at $0.00 — through the free tiers and free credits that actually exist.**

No cracks. No rooted-phone billing hooks. No shared logins. Everything here uses terms the provider publishes,
so your accounts stay alive and your GitHub stays clean.

```bash
git clone https://github.com/wolverinenhm/FreeAISubscription
cd FreeAISubscription
node src/cli.js doctor      # what is already usable on this machine
node src/cli.js providers   # every free tier the router knows
node src/cli.js ask "explain CRDTs in two paragraphs"
```

No dependencies, no build step. Node 18 or newer.

---

## The part the course sellers leave out

Google AI Ultra, Claude Pro/Max and ChatGPT Plus are paid plans. There is no flag, header, cookie or script that
makes them free, and every project claiming otherwise is doing at least one of these:

| What the repo really does | What it costs you |
| --- | --- |
| Hooks a billing library on a rooted phone to activate a 0-price trial offer the store never offered you | Billing fraud. Google closes the account and can reclaim the subscription |
| Batching logins from a credential list (`email----password----2fa`) | You are running an account farm for someone else |
| A "one-click script" behind a WeChat / Telegram group | The tutorial is the product; the group is the funnel |
| Shared "unlimited" API resellers at $2/month | Stolen keys or leaked cookies; the seller disappears with your prompts |

All of it violates the provider terms, much of it is criminal fraud rather than a grey area, and the most likely
outcome is a permanent ban on the account you actually use. This repo ships none of it — and if a repo you found
does, see [docs/faq.md](docs/faq.md#why-not-the-rooted-phone-scripts) before you run it.

---

## What is genuinely $0.00

These are real, currently published, and need no card. Limits change — every page links its own source.

| You want | The real free path | Card | Where |
| --- | --- | --- | --- |
| **Gemini**, the assistant | Gemini free tier in the web app, Android and iOS | no | [docs/gemini.md](docs/gemini.md) |
| **Gemini**, in your own code | AI Studio API key, rate-limited free tier | no | [docs/gemini.md](docs/gemini.md) |
| **Gemini** for a whole year | Student / regional promo on Google AI Pro where offered | no | [docs/gemini.md](docs/gemini.md) |
| **Claude**, the assistant | Claude free plan on claude.ai | no | [docs/claude.md](docs/claude.md) |
| **Claude**, in your editor | GitHub Copilot Free — Claude and GPT models in the picker | no | [docs/claude.md](docs/claude.md) |
| **Claude**, in code | Bedrock / Vertex credits from a startup or student program | no | [docs/dev-programs.md](docs/dev-programs.md) |
| **ChatGPT**, the assistant | ChatGPT free tier | no | [docs/chatgpt.md](docs/chatgpt.md) |
| **GPT models**, in your own code | GitHub Models free tier with a GitHub account | no | [docs/chatgpt.md](docs/chatgpt.md) |
| **Anything**, offline forever | Local open-weight models via Ollama | no | [docs/local-models.md](docs/local-models.md) |

Two things worth saying plainly:

- **The OpenAI API has no free tier.** Pay-as-you-go, minimum top-up. Any "free GPT-4 API key" you are offered is stolen.
- **Anthropic has no free API tier.** Claude in code means credits — startup program, cloud credits, or a paid key.

The free web assistant and the free API are different products with different limits. Both are free; only one of
them is programmable. That is the whole reason this repo has two halves: [docs](docs/) for people, and a router
for code.

---

## The router

One command, seven free backends, automatic failover. When a tier answers `429` the router cools it down and tries
the next one, so a single prompt keeps working across every free quota you have.

```bash
node src/cli.js ask "summarise this changelog" --provider gemini
node src/cli.js ask "summarise this changelog" --chain gemini,github-models,groq,ollama
node src/cli.js ask "summarise this changelog" --json
echo "pipe a prompt in" | node src/cli.js ask -
```

```js
import { createRouter } from "./src/router.js";

const router = createRouter();
const { text, provider, attempts } = await router.chat([
  { role: "user", content: "hello" },
]);
console.log(provider, text);   // e.g. "groq" after gemini returned 429
```

| Backend | Free tier | Key |
| --- | --- | --- |
| `gemini` | Google AI Studio | `GEMINI_API_KEY` |
| `github-models` | GitHub Models | `GITHUB_TOKEN` |
| `groq` | Groq | `GROQ_API_KEY` |
| `cerebras` | Cerebras | `CEREBRAS_API_KEY` |
| `openrouter` | OpenRouter `:free` models | `OPENROUTER_API_KEY` |
| `mistral` | Mistral Experiment tier | `MISTRAL_API_KEY` |
| `ollama` | Local, offline | none |
| `custom` | Any OpenAI-compatible endpoint | `CUSTOM_BASE_URL` |

Copy `.env.example` to `.env` and fill in whatever you already have. Missing keys are skipped, never fatal.

The router deliberately speaks **one** wire format — OpenAI chat completions — because that is the shape every
free tier now exposes. That is what keeps it at zero dependencies instead of eight SDKs.

---

## Docs

| Page | What it covers |
| --- | --- |
| [gemini.md](docs/gemini.md) | Free app, free API key, free CLI, student and regional promos |
| [claude.md](docs/claude.md) | Free plan, Copilot Free, education, where Claude models are reachable at $0 |
| [chatgpt.md](docs/chatgpt.md) | Free plan, GitHub Models, Azure credits, why the API is not free |
| [free-api-providers.md](docs/free-api-providers.md) | Groq, Cerebras, OpenRouter, Mistral — what each free tier is good at |
| [dev-programs.md](docs/dev-programs.md) | Cloud and startup credits that pay for Claude and GPT tokens |
| [local-models.md](docs/local-models.md) | Ollama, LM Studio, hardware sizing, what actually runs |
| [limits.md](docs/limits.md) | How to read a 429, and why the router never hardcodes quotas |
| [faq.md](docs/faq.md) | The scams, the myths, and the questions that come up every time |

---

## Design rules

1. **No quota tables in code.** Published limits change monthly; the router reacts to `429` instead of predicting it.
2. **No silently paid backends.** A provider is only in the default chain if its tier is genuinely free.
3. **Keys stay local.** `.env` is gitignored; no telemetry, no proxy, no "relay" service in the middle.
4. **Fail loud.** When every backend is exhausted the CLI prints each provider, its status code and its message.

---

## Tests

```bash
node --test test/
```

The suite runs offline against a stubbed `fetch`, so it never spends a quota to prove the fallback works.

## Contributing

A free tier changed, died, or a new one appeared? Open a PR that touches the registry and the matching doc page.
Please keep the promise above: if it is not free for everyone with an account, it does not go in the chain.

## License

MIT. Docs last reviewed 2026-11-18; verify limits at the provider before you build a product on them.