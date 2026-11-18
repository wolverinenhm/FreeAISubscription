# Free API providers that are actually free

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

The pattern behind every one of these: a free allowance sized for evaluation and small projects, behind an account,
because the company wants you to graduate to paid. None of them are a free version of GPT-4-class unlimited access,
and any that claims to be is lying.

## What each one is good at

| Provider | Wire format | Why you would pick it | Env var |
| --- | --- | --- | --- |
| **Google AI Studio** | OpenAI-compatible | biggest free token allowance, the default choice | `GEMINI_API_KEY` |
| **GitHub Models** | OpenAI-compatible | GPT-class models, no new account needed | `GITHUB_TOKEN` |
| **Groq** | OpenAI-compatible | fastest tokens per second by a wide margin | `GROQ_API_KEY` |
| **Cerebras** | OpenAI-compatible | very fast, separate quota from Groq | `CEREBRAS_API_KEY` |
| **OpenRouter** | OpenAI-compatible | one key, many models; free ids end in `:free` | `OPENROUTER_API_KEY` |
| **Mistral** | OpenAI-compatible | European models, free Experiment tier | `MISTRAL_API_KEY` |
| **Ollama** | OpenAI-compatible | offline, unlimited, private | none |

## Groq

Models are hosted on custom silicon, so time-to-first-token is the best of anything free. Free tier is rate
limited rather than credit limited. If your application feels slow on Gemini, this is the free fallback that fixes it.

<https://console.groq.com/keys>

## Cerebras

Same story with different hardware and a separate quota, which is exactly why it is worth having both: when one
says 429 the other usually does not. <https://cloud.cerebras.ai>

## OpenRouter

One key for dozens of models. Only the ids ending in `:free` cost nothing, and those rotate as the underlying
providers change their minds:

```bash
# list what is free today
curl -s https://openrouter.ai/api/v1/models | grep -o '"id":"[^"]*:free"'
echo "OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free" >> .env
```

Free ids are rate limited per day, and OpenRouter throttles accounts that hammer them. <https://openrouter.ai/keys>

## Mistral

The Experiment tier needs phone verification and no card. Smaller models, genuinely useful for classification and
extraction. <https://console.mistral.ai/api-keys>

## Honourable mentions

- **Cloudflare Workers AI** — a small free daily allowance of neurons; good if you already deploy on Workers.
- **Hugging Face Inference Providers** — a small monthly credit for hosted models.
- **Google Colab** — a free GPU for running notebooks, not an API. Relevant because it is how you run a model
  bigger than your laptop otherwise could.

## The rule this repo follows

A provider only joins the default chain if a normal person can use it indefinitely without ever entering card
details. Trials that expire, credits that run out, and "free while in beta" products stay in the docs and out of
the chain, because a backend that silently dies in three weeks is worse than no backend.