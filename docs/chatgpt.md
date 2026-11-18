# ChatGPT and GPT models at $0.00

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

Same split as Claude: the assistant is free, the API is not.

## 1. The assistant — chatgpt.com free tier

No card. Free accounts get the current default model with a message allowance, plus web search, file upload and
voice, with caps that reset on a rolling window. When a limit is reached the product tells you and degrades you to a
smaller model rather than locking you out.

## 2. GPT models in your own code, for free

The OpenAI API itself has **no free tier** and a minimum credit purchase. But OpenAI models are served by other
platforms that do have free allowances:

| Platform | What you get | Card |
| --- | --- | --- |
| GitHub Models | `openai/gpt-4o-mini` and friends, free request allowance per GitHub account | no |
| Azure free account | time-boxed credit that can be spent on Azure OpenAI models | card for identity, credit covers usage |
| Cloudflare Workers AI | small free daily allowance, includes open models, not GPT | no |

GitHub Models is what this repo wires up, because a GitHub account you already have is the only requirement:

```bash
# token needs the "models" scope
echo "GITHUB_TOKEN=ghp_..." >> .env
node src/cli.js ask "hello" --provider github-models
GITHUB_MODELS_MODEL=openai/gpt-4o-mini node src/cli.js ask "hello" --provider github-models
```

## 3. Why "free GPT-4 API key" lists are always a scam

OpenAI bills per token against a funded account. A key that works costs its owner money on every call, so any
publicly posted key is one of:

- a leaked key that will be revoked within hours (and whose usage may be traced to you),
- a proxy that sits between you and the real API and keeps every prompt you send,
- a key minted from a stolen account.

None of these is a free tier. The first is a felony in most jurisdictions if you keep using it after you know.

## 4. Running the models locally instead

Open weights from Meta, Qwen, DeepSeek and Mistral cover a lot of what people use GPT for, at zero marginal cost
and with no rate limit. See [local-models.md](local-models.md).

## The pragmatic answer

Free app for everyday chat. GitHub Models when you need GPT-shaped output from a script. Local weights for bulk or
sensitive work. If a product needs the real OpenAI API, it needs a budget line, and pretending otherwise is how
projects die on a revoked key.