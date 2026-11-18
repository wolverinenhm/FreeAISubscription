#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { loadEnv } from "./config.js";
import { DEFAULT_CHAIN, PROVIDER_IDS, availableProviders, resolveProvider } from "./providers.js";
import { createRouter } from "./router.js";

const USAGE = [
  "freeai - reach Gemini, Claude-class and GPT-class models for $0.00",
  "",
  "Usage:",
  "  freeai providers                  list every backend and whether it is ready",
  "  freeai doctor                     what works on this machine right now",
  "  freeai ask <prompt|-> [options]    send a prompt, falling back across free tiers",
  "",
  "Options:",
  "  --provider <id>     use exactly one backend",
  "  --chain a,b,c       override the fallback order",
  "  --system <text>     prepend a system message",
  "  --max-tokens <n>    cap the reply length",
  "  --json              print the full result object",
].join("\n");

function parseArgs(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") { flags.json = true; continue; }
    if (arg === "--provider" || arg === "--chain" || arg === "--system" || arg === "--max-tokens") {
      const value = argv[i + 1];
      if (value === undefined) throw new Error(arg + " needs a value");
      flags[arg.slice(2)] = value;
      i += 1;
      continue;
    }
    positional.push(arg);
  }
  return { flags, positional };
}

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function pad(text, width) {
  const value = String(text);
  return value.length >= width ? value : value + " ".repeat(width - value.length);
}

function cmdProviders(env) {
  process.stdout.write(pad("BACKEND", 16) + pad("READY", 7) + pad("KEY", 24) + "MODEL\n");
  process.stdout.write("-".repeat(78) + "\n");
  for (const id of PROVIDER_IDS) {
    const p = resolveProvider(id, env);
    const ready = p.configured ? "yes" : "no";
    process.stdout.write(
      pad(id, 16) + pad(ready, 7) + pad(p.keyEnv || "-", 24) + p.model + "\n",
    );
  }
  const ready = availableProviders(env);
  process.stdout.write("\n" + ready.length + " backend(s) ready: " + (ready.join(", ") || "none") + "\n");
  if (ready.length === 0) {
    process.stdout.write("Copy .env.example to .env and add one free key, or install Ollama.\n");
  }
  return 0;
}

async function cmdDoctor(env) {
  process.stdout.write("node " + process.version + "\n\n");
  for (const id of PROVIDER_IDS) {
    const p = resolveProvider(id, env);
    const state = p.configured ? "ready" : p.requiresKey ? "missing " + p.keyEnv : "not reachable";
    process.stdout.write(pad(id, 16) + pad(state, 28) + p.note + "\n");
    if (!p.configured && p.signup) process.stdout.write(pad("", 16) + "get it: " + p.signup + "\n");
  }

  const local = resolveProvider("ollama", env);
  let localUp = false;
  try {
    const init = {};
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      init.signal = AbortSignal.timeout(1500);
    }
    const res = await fetch(local.baseUrl + "/models", init);
    localUp = res.ok;
  } catch {
    localUp = false;
  }

  const ready = availableProviders(env);
  process.stdout.write("\nollama daemon: " + (localUp ? "up at " + local.baseUrl : "not running (start it with: ollama serve)") + "\n");
  process.stdout.write(ready.length + " backend(s) ready: " + (ready.join(", ") || "none") + "\n");
  if (ready.length === 0 && !localUp) {
    process.stdout.write("Nothing is ready yet. The fastest $0 path: install Ollama, or grab a free AI Studio key.\n");
  }
  return 0;
}

async function cmdAsk(env, argv) {
  const { flags, positional } = parseArgs(argv);
  let prompt = positional.join(" ").trim();
  if (!prompt || prompt === "-") prompt = readStdin().trim();
  if (!prompt) {
    process.stderr.write("no prompt given\n\n" + USAGE + "\n");
    return 1;
  }

  const chain = flags.provider
    ? [flags.provider]
    : flags.chain
      ? flags.chain.split(",").map((s) => s.trim()).filter(Boolean)
      : DEFAULT_CHAIN;

  const messages = [];
  if (flags.system) messages.push({ role: "system", content: flags.system });
  messages.push({ role: "user", content: prompt });

  const maxTokens = flags["max-tokens"] ? Number(flags["max-tokens"]) : undefined;
  const router = createRouter({ env, chain });

  try {
    const result = await router.chat(messages, { providers: chain, maxTokens });
    for (const attempt of result.attempts) {
      process.stderr.write("fallback: " + attempt.provider + " failed with " + (attempt.status || "network") + "\n");
    }
    if (flags.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    } else {
      process.stdout.write(result.text + "\n");
      process.stderr.write("[" + result.provider + " / " + result.model + "]\n");
    }
    return 0;
  } catch (err) {
    process.stderr.write(err.message + "\n");
    process.stderr.write("Run: freeai doctor\n");
    return 1;
  }
}

async function main(argv) {
  const env = loadEnv();
  const [command, ...rest] = argv;
  if (!command || command === "help" || command === "--help" || command === "-h") {
    process.stdout.write(USAGE + "\n");
    return 0;
  }
  if (command === "providers") return cmdProviders(env);
  if (command === "doctor") return cmdDoctor(env);
  if (command === "ask") return cmdAsk(env, rest);
  process.stderr.write("unknown command: " + command + "\n\n" + USAGE + "\n");
  return 1;
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(String(err && err.stack ? err.stack : err) + "\n");
    process.exit(1);
  },
);