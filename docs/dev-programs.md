# Credits: the legal way to pay for tokens

> Last reviewed 2026-11-18. Free tiers change — check the linked page before you depend on a number.

When you need real API access and cannot pay retail, the money comes from a program. This is the part most "free AI"
guides skip, and it is the only scalable version of the request.

Two things to understand before you start:

1. **Credits are not free money forever.** They are time-boxed, usually need a card for identity, and expire.
2. **The cloud is the loophole-free path to Claude and GPT.** Bedrock, Vertex AI and Azure Foundry all serve those
   models, so a cloud credit spends like an Anthropic or OpenAI credit would.

## General cloud credits

| Program | Typical shape | Buys you |
| --- | --- | --- |
| Google Cloud free trial | new-account credit, ~90 days | Vertex AI → Gemini and Claude |
| Azure free account | new-account credit, ~30 days, plus always-free services | Azure OpenAI and Foundry models |
| AWS Activate (Founders) | tiered credits, needs a startup | Bedrock → Claude, Llama, Mistral |
| Microsoft for Startups | tiered Azure credits, needs a company | Foundry models |
| Google for Startups | tiered credits, needs a startup | Vertex AI → Gemini and Claude |

Exact amounts move constantly. The point is the shape: a fresh account usually gets a few hundred dollars of
credit, a startup gets thousands, and both spend on the same model endpoints.

## Student routes

- **GitHub Student Developer Pack** — free while you are a student; includes Copilot and a long list of partner credits.
- **Google AI Pro for students** — free in eligible countries with verification. See [gemini.md](gemini.md).
- **University site licences** — a lot of schools already pay for Copilot, ChatGPT Edu or Claude for Education.
  Check your IT page before spending anything; this is the single most overlooked free path.

## How this interacts with the router

Cloud-hosted models are OpenAI-incompatible in the general case (Bedrock and Vertex both have their own signing),
so this repo does not wire them up. The pattern that works:

1. Run a thin OpenAI-compatible gateway in front of your cloud account (LiteLLM is the usual choice).
2. Point this router at it:

```bash
echo "CUSTOM_BASE_URL=http://127.0.0.1:4000/v1" >> .env
echo "CUSTOM_API_KEY=anything-the-gateway-accepts" >> .env
echo "CUSTOM_MODEL=bedrock/anthropic.claude-sonnet" >> .env
node src/cli.js ask "hello" --provider custom
```

That way credits power the strong model while the free tiers stay in front of it for everything cheap.

## The honest cost model

If a project needs thousands of requests per day on a top model, someone pays. The choice is who: a program, an
employer, a university, or you. There is no fourth option, and a repo that promises one is selling you something
worse than a bill.