// Provider registry. Every entry speaks one wire format: OpenAI chat completions.
// That is what keeps this router dependency-free and every free tier interchangeable.

import { firstEnv } from "./config.js";

export const PROVIDERS = {
  gemini: {
    label: "Google Gemini (AI Studio free tier)",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    keyEnv: "GEMINI_API_KEY",
    keyAliases: ["GOOGLE_API_KEY"],
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-2.0-flash",
    requiresKey: true,
    signup: "https://aistudio.google.com/apikey",
    note: "Free tier, no card. Rate limited per minute and per day.",
  },
  "github-models": {
    label: "GitHub Models (free with a GitHub account)",
    baseUrl: "https://models.github.ai/inference",
    keyEnv: "GITHUB_TOKEN",
    keyAliases: ["GH_TOKEN", "GITHUB_MODELS_TOKEN"],
    modelEnv: "GITHUB_MODELS_MODEL",
    defaultModel: "openai/gpt-4o-mini",
    requiresKey: true,
    signup: "https://github.com/settings/tokens",
    note: "Token needs the models scope. Free request allowance per account.",
  },
  groq: {
    label: "Groq (free tier)",
    baseUrl: "https://api.groq.com/openai/v1",
    keyEnv: "GROQ_API_KEY",
    modelEnv: "GROQ_MODEL",
    defaultModel: "llama-3.3-70b-versatile",
    requiresKey: true,
    signup: "https://console.groq.com/keys",
    note: "Very fast inference. Free tier is rate limited, not credit based.",
  },
  cerebras: {
    label: "Cerebras (free tier)",
    baseUrl: "https://api.cerebras.ai/v1",
    keyEnv: "CEREBRAS_API_KEY",
    modelEnv: "CEREBRAS_MODEL",
    defaultModel: "llama3.1-8b",
    requiresKey: true,
    signup: "https://cloud.cerebras.ai",
    note: "Free tier with a daily token allowance.",
  },
  openrouter: {
    label: "OpenRouter (free model ids end in :free)",
    baseUrl: "https://openrouter.ai/api/v1",
    keyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    defaultModel: "deepseek/deepseek-chat-v3-0324:free",
    requiresKey: true,
    signup: "https://openrouter.ai/keys",
    note: "Only models ending in :free cost nothing. Free ids rotate.",
  },
  mistral: {
    label: "Mistral (Experiment tier)",
    baseUrl: "https://api.mistral.ai/v1",
    keyEnv: "MISTRAL_API_KEY",
    modelEnv: "MISTRAL_MODEL",
    defaultModel: "open-mistral-nemo",
    requiresKey: true,
    signup: "https://console.mistral.ai/api-keys",
    note: "Free experiment tier requires phone verification, no card.",
  },
  ollama: {
    label: "Ollama (local, offline, no account)",
    baseUrl: "http://127.0.0.1:11434/v1",
    baseUrlEnv: "OLLAMA_BASE_URL",
    modelEnv: "OLLAMA_MODEL",
    defaultModel: "llama3.2",
    requiresKey: false,
    signup: "https://ollama.com",
    note: "Runs on your machine. The only tier that cannot rate limit you.",
  },
  custom: {
    label: "Custom OpenAI-compatible endpoint",
    baseUrl: "",
    baseUrlEnv: "CUSTOM_BASE_URL",
    keyEnv: "CUSTOM_API_KEY",
    modelEnv: "CUSTOM_MODEL",
    defaultModel: "",
    requiresKey: true,
    signup: "",
    note: "Opt in only: pass --provider custom or add it to --chain.",
  },
};

// Order matters only for cost of a wasted call: local and highest-quota tiers first.
export const DEFAULT_CHAIN = [
  "gemini",
  "github-models",
  "groq",
  "cerebras",
  "openrouter",
  "mistral",
  "ollama",
];

export const PROVIDER_IDS = Object.keys(PROVIDERS);

export function resolveProvider(id, env = process.env) {
  const def = PROVIDERS[id];
  if (!def) {
    throw new Error("Unknown provider: " + id + ". Known: " + PROVIDER_IDS.join(", "));
  }
  const baseUrl = stripSlash(
    (def.baseUrlEnv ? String(env[def.baseUrlEnv] || "").trim() : "") || def.baseUrl,
  );
  const apiKey = def.keyEnv ? firstEnv(env, [def.keyEnv, ...(def.keyAliases || [])]) : "";
  const model = (def.modelEnv ? String(env[def.modelEnv] || "").trim() : "") || def.defaultModel;
  const configured = def.requiresKey
    ? Boolean(apiKey && baseUrl && model)
    : Boolean(baseUrl && model);
  return {
    id,
    label: def.label,
    baseUrl,
    apiKey,
    model,
    configured,
    requiresKey: Boolean(def.requiresKey),
    keyEnv: def.keyEnv || "",
    signup: def.signup || "",
    note: def.note || "",
  };
}

export function availableProviders(env = process.env, chain = DEFAULT_CHAIN) {
  return chain.filter((id) => resolveProvider(id, env).configured);
}

function stripSlash(url) {
  return String(url || "").replace(/\/+$/, "");
}