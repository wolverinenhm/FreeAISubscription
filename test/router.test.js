import test from "node:test";
import assert from "node:assert/strict";
import { createRouter } from "../src/router.js";
import { availableProviders, resolveProvider } from "../src/providers.js";

function reply(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: String(status),
    json: async () => payload,
  };
}

const okWith = (text) => reply(200, { choices: [{ message: { content: text } }] });
const failWith = (status, message) => reply(status, { error: { message } });

test("sends an OpenAI-shaped request with the bearer key", async () => {
  const calls = [];
  const router = createRouter({
    env: { GEMINI_API_KEY: "secret" },
    chain: ["gemini"],
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return okWith("hello");
    },
  });

  const result = await router.chat("hi");
  assert.equal(result.text, "hello");
  assert.equal(result.provider, "gemini");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");
  assert.equal(calls[0].init.headers.authorization, "Bearer secret");
  assert.equal(JSON.parse(calls[0].init.body).model, "gemini-2.0-flash");
  assert.deepEqual(JSON.parse(calls[0].init.body).messages, [{ role: "user", content: "hi" }]);
});

test("falls back to the next free tier when one returns 429", async () => {
  const router = createRouter({
    env: { GEMINI_API_KEY: "a", GROQ_API_KEY: "b" },
    chain: ["gemini", "groq"],
    fetchImpl: async (url) => (url.includes("groq") ? okWith("from groq") : failWith(429, "rate limited")),
  });

  const result = await router.chat("hi");
  assert.equal(result.provider, "groq");
  assert.equal(result.text, "from groq");
  assert.equal(result.attempts.length, 1);
  assert.equal(result.attempts[0].provider, "gemini");
  assert.equal(result.attempts[0].status, 429);
});

test("a backend that failed is skipped until its cooldown expires", async () => {
  let geminiCalls = 0;
  let clock = 1000;
  const router = createRouter({
    env: { GEMINI_API_KEY: "a", GROQ_API_KEY: "b" },
    chain: ["gemini", "groq"],
    cooldownMs: 60000,
    now: () => clock,
    fetchImpl: async (url) => {
      if (url.includes("googleapis")) {
        geminiCalls += 1;
        return failWith(429, "quota");
      }
      return okWith("groq answer");
    },
  });

  await router.chat("one");
  assert.equal(geminiCalls, 1);

  const second = await router.chat("two");
  assert.equal(geminiCalls, 1, "gemini must not be called again while cooling down");
  assert.equal(second.provider, "groq");
  assert.ok(second.skipped.some((s) => s.provider === "gemini"));

  clock += 61000;
  await router.chat("three");
  assert.equal(geminiCalls, 2, "gemini is retried once the cooldown lapses");
});

test("a 400 is our own bad request, so it does not cool the backend down", async () => {
  const router = createRouter({
    env: { GEMINI_API_KEY: "a", GROQ_API_KEY: "b" },
    chain: ["gemini", "groq"],
    fetchImpl: async (url) => (url.includes("googleapis") ? failWith(400, "bad request") : okWith("ok")),
  });

  const result = await router.chat("hi");
  assert.equal(result.provider, "groq");
  assert.equal(router.cooldowns.size, 0);
});

test("unconfigured backends are skipped without touching the network", async () => {
  const seen = [];
  const router = createRouter({
    env: { GROQ_API_KEY: "b" },
    chain: ["gemini", "groq"],
    fetchImpl: async (url) => {
      seen.push(url);
      return okWith("ok");
    },
  });

  const result = await router.chat("hi");
  assert.equal(result.provider, "groq");
  assert.equal(seen.length, 1);
  assert.equal(result.skipped[0].provider, "gemini");
  assert.equal(result.skipped[0].reason, "not configured");
});

test("exhausting every backend reports each one by name and status", async () => {
  const router = createRouter({
    env: { GEMINI_API_KEY: "a", GROQ_API_KEY: "b" },
    chain: ["gemini", "groq"],
    fetchImpl: async (url) => (url.includes("googleapis") ? failWith(429, "quota") : failWith(500, "boom")),
  });

  await assert.rejects(
    () => router.chat("hi"),
    (err) => {
      assert.match(err.message, /All free backends failed/);
      assert.match(err.message, /gemini \(429\): quota/);
      assert.match(err.message, /groq \(500\): boom/);
      return true;
    },
  );
});

test("array-shaped content is flattened into text", async () => {
  const router = createRouter({
    env: { GROQ_API_KEY: "b" },
    chain: ["groq"],
    fetchImpl: async () =>
      reply(200, { choices: [{ message: { content: [{ text: "part one " }, { text: "part two" }] } }] }),
  });

  const result = await router.chat("hi");
  assert.equal(result.text, "part one part two");
});

test("ollama needs no key and is reported as available", () => {
  const env = {};
  assert.equal(resolveProvider("ollama", env).configured, true);
  assert.deepEqual(availableProviders(env, ["gemini", "ollama"]), ["ollama"]);
});

test("model can be overridden per provider through the environment", () => {
  const provider = resolveProvider("groq", { GROQ_API_KEY: "b", GROQ_MODEL: "custom-model" });
  assert.equal(provider.model, "custom-model");
});

test("the chain can be overridden per router instance", async () => {
  const router = createRouter({
    env: { GEMINI_API_KEY: "a", GROQ_API_KEY: "b" },
    chain: ["groq", "gemini"],
    fetchImpl: async (url) => okWith(url.includes("groq") ? "groq first" : "gemini first"),
  });
  const result = await router.chat("hi");
  assert.equal(result.text, "groq first");
});