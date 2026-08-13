# AI Connection Settings — bring your own key or your own machine

Right now the chat in Operators only works if the site owner has an OpenRouter key set on the
server. There is nowhere for a visitor to plug in their own key, pick a free model, or point the
tools at the Ollama models running on their own computer — and no way to see whether the connection
actually works.

This adds an AI Connections panel with live status lights, used by the Operators demo chat and by
every tool we add to the Workspace later.

## What the user gets

A gear button ("AI CONNECTION") in the header of Operators and Workspace opens a panel with three
providers. A coloured dot shows the state of each: grey = not configured, amber = testing,
green = tested and working, red = failed with the exact reason shown underneath.

**1. Site AI (default, no setup)**
Uses the site's own AI so everything works out of the box. Selected by default for people who don't
want to configure anything.

**2. OpenRouter — your own API key**
- Paste your key (`sk-or-v1-...`). Stored only in your own browser, never sent to our database.
- "Test connection" verifies the key and turns the light green.
- A **free models** picker: the panel pulls the live model list from OpenRouter, filters to the ones
  that cost nothing (`:free`), and shows them with context length. A "show all models" toggle
  reveals paid ones for people who want them.
- A link to where to get a key.

**3. Ollama — models on your own device**
- Enter your Ollama address (default `http://localhost:11434`).
- "Detect models" asks your machine directly for its installed models and fills a dropdown; the
  light goes green when it answers.
- If the browser is blocked from reaching it, the panel shows the exact one-line fix
  (`OLLAMA_ORIGINS` must allow this site) with a copy button, instead of a vague error.

Choices are remembered per browser, so a returning visitor keeps their setup. A small status chip
next to the chat input shows which provider is live ("OPENROUTER · GEMMA 3 FREE"), and clicking it
opens the panel.

## Behaviour rules

- Your key and your Ollama address never leave your browser: the OpenRouter and Ollama calls for a
  visitor's own connection are made straight from the browser. Only Site AI runs through our server.
- Ollama has to work this way — `localhost` is your computer, our server cannot reach it.
- If a visitor's provider fails mid-chat, the message isn't lost: we show the real error and offer a
  one-click "use Site AI instead".
- Existing behaviour is preserved: with nothing configured, the demo chat works as it does today.

## Technical notes

- New `src/lib/ai-connection.ts`: provider config type, localStorage persistence, browser-side
  `testOpenRouter` / `listFreeModels` / `testOllama` / `listOllamaModels`, and a `sendChat` router
  that picks browser-direct (bring-your-own) or the existing `chatWithAgent` server function
  (Site AI).
- New `src/components/AiConnectionPanel.tsx` (panel + trigger button + status dot), styled with the
  existing `corner` / `border-line` / `label` conventions and working in light and dark mode.
- `src/lib/agent.functions.ts`: keep the current OpenRouter/Ollama env path, add Lovable AI as the
  Site AI backend so the default works without any key, and return structured errors instead of the
  current generic "having trouble connecting" string.
- `src/routes/agents.tsx` `DemoChat`: send through `sendChat`, add the status chip and panel
  trigger. Image attachments keep working (multimodal parts pass through for models that support
  them; the panel flags when the selected free model is text-only).
- Model lists are fetched live and cached in memory per session — no hardcoded catalogue that goes
  stale.
- No database changes.