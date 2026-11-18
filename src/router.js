// Fallback router across free tiers.
// Design rule: no quota tables in code. Published limits change monthly,
// so this reacts to 429 instead of predicting it.

import { DEFAULT_CHAIN, availableProviders, resolveProvider } from "./providers.js";

// Statuses that mean "this backend is not usable right now" rather than "your prompt is wrong".
const COOLDOWN_STATUS = new Set([401, 402, 403, 404, 408, 409, 429, 500, 502, 503, 504, 529]);

function makeError(status, message) {
  const err = new Error(message);
  if (status !== undefined) err.status = status;
  return err;
}

function errorMessage(data) {
  if (!data) return "";
  if (typeof data.error === "string") return data.error;
  if (data.error && typeof data.error.message === "string") return data.error.message;
  if (typeof data.message === "string") return data.message;
  return "";
}

function completionText(data) {
  const choice = data && Array.isArray(data.choices) ? data.choices[0] : null;
  const content = choice && choice.message ? choice.message.content : null;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((part) => (part && typeof part.text === "string" ? part.text : "")).join("");
  }
  return "";
}

export function createRouter(options = {}) {
  const env = options.env || process.env;
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  const now = options.now || (() => Date.now());
  const cooldownMs = options.cooldownMs === undefined ? 60000 : options.cooldownMs;
  const timeoutMs = options.timeoutMs === undefined ? 60000 : options.timeoutMs;
  const chain = options.chain || DEFAULT_CHAIN;
  const cooldowns = new Map();

  async function callProvider(provider, messages, maxTokens) {
    const body = { model: provider.model, messages };
    if (maxTokens) body.max_tokens = maxTokens;

    const headers = { "content-type": "application/json" };
    if (provider.apiKey) headers.authorization = "Bearer " + provider.apiKey;

    const init = { method: "POST", headers, body: JSON.stringify(body) };
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      init.signal = AbortSignal.timeout(timeoutMs);
    }

    const res = await fetchImpl(provider.baseUrl + "/chat/completions", init);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      throw makeError(res.status, errorMessage(data) || res.statusText || "request failed");
    }
    const text = completionText(data).trim();
    if (!text) throw makeError(undefined, "empty completion");
    return text;
  }

  function coolDown(provider) {
    cooldowns.set(provider.id + ":" + provider.model, now() + cooldownMs);
  }

  function coolingDown(provider) {
    const until = cooldowns.get(provider.id + ":" + provider.model);
    return typeof until === "number" && until > now();
  }

  async function chat(input, opts = {}) {
    const messages = typeof input === "string" ? [{ role: "user", content: input }] : input;
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("chat() needs messages: [{ role, content }]");
    }
    const order = opts.providers || opts.chain || chain;
    const maxTokens = opts.maxTokens;
    const attempts = [];
    const skipped = [];

    for (const id of order) {
      let provider;
      try {
        provider = resolveProvider(id, env);
      } catch (err) {
        skipped.push({ provider: id, reason: err.message });
        continue;
      }
      if (!provider.configured) {
        skipped.push({ provider: id, reason: "not configured" });
        continue;
      }
      if (coolingDown(provider)) {
        skipped.push({ provider: id, reason: "cooling down after an error" });
        continue;
      }

      try {
        const text = await callProvider(provider, messages, maxTokens);
        return { text, provider: id, model: provider.model, attempts, skipped };
      } catch (err) {
        const status = err.status;
        if (status === undefined || COOLDOWN_STATUS.has(status) || status >= 500) coolDown(provider);
        attempts.push({ provider: id, model: provider.model, status, error: err.message });
      }
    }

    const detail = attempts.length
      ? attempts.map((a) => a.provider + " (" + (a.status === undefined ? "network" : a.status) + "): " + a.error).join("; ")
      : "no configured provider in the chain (" + order.join(",") + ")";
    throw new Error("All free backends failed -> " + detail);
  }

  return {
    chat,
    chain,
    cooldowns,
    available: () => availableProviders(env, chain),
  };
}