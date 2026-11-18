# Local models: the only truly unlimited $0.00

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

A rate limit is a property of someone else server. Running the model yourself removes the server, and with it the
account, the card and the quota. Open weights from Meta, Qwen, DeepSeek, Mistral, Google (Gemma) and others are
genuinely free to download and use.

## Ollama, in three commands

```bash
# 1. install from https://ollama.com  (Windows, macOS, Linux)
ollama pull llama3.2
ollama serve
```

That exposes an OpenAI-compatible endpoint at `http://127.0.0.1:11434/v1`, which is what this repo talks to:

```bash
node src/cli.js ask "hello" --provider ollama
# or put it first in the chain when you are offline
node src/cli.js ask "hello" --chain ollama,gemini
```

`OLLAMA_MODEL` and `OLLAMA_BASE_URL` override the defaults.

## What actually fits in your machine

Quantised models need roughly *parameters × 0.6 GB* of memory, plus context. Rough guide:

| RAM / VRAM | Comfortable | Painful but possible |
| --- | --- | --- |
| 8 GB | 3-4B | 7-8B at low quantisation |
| 16 GB | 7-8B | 13-14B |
| 32 GB | 13-14B | 30B |
| 64 GB+ | 30-32B | 70B slowly |

A GPU changes speed far more than it changes capability: a 7B on CPU is usable for one-off questions, and
unpleasant for anything interactive. Apple Silicon runs these unusually well because memory is unified.

## What local models are good at, and what they are not

- **Good:** classification, extraction, rewriting, summarising, code completion in a narrow domain, anything private,
  anything high volume, anything you must not send to a vendor.
- **Not good:** long-horizon reasoning, agentic tool use across many steps, and anything where the frontier models are
  already only just correct. A 7B model is not a GPT-class model and no prompt closes that gap.

The practical pattern is a hybrid, which is exactly what the router is for: local model for the 90% that is
mechanical, free hosted tier for the 10% that needs a frontier model.

## Beyond Ollama

- **LM Studio** — a GUI over the same idea, good for trying models without a terminal.
- **llama.cpp** — the engine underneath most of this; fastest path if you are willing to tune flags.
- **vLLM** — for serving one model to several programs at once on a real GPU.

All three are free and open source. None of them need an account, which is the entire point.