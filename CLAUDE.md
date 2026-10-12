# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository currently contains **no source code** — it is in the planning stage. The only
contents are:

- `計画書.md` — the approved project plan (scope, architecture, schedule, acceptance criteria).
  Read this first before implementing anything; it is the source of truth for what to build and
  what is explicitly out of scope for this phase.
- `.claude/agents/` — predefined subagents for this project (see below).

There is no `package.json`, build tooling, lint config, or test runner yet. Do not invent build/
lint/test commands — once the codebase is scaffolded, this file should be updated with the real
commands.

## Intended architecture (from 計画書.md)

The planned system is a LINE bot with AI-powered FAQ auto-response:

- **LINE Messaging API** — existing official account; receives user messages via webhook and
  sends replies/broadcasts.
- **Vercel** (serverless functions) — hosts the webhook endpoint and the admin management screen.
- **Claude API** — generates FAQ answers and judges whether an incoming question is answerable
  from the FAQ set; unanswerable questions are escalated instead of guessed at.
- **Supabase** (Postgres) — stores FAQ entries, inquiry logs, and the broadcast friend list.

Request flow: LINE user → Messaging API webhook → Vercel function → (Supabase FAQ lookup +
Claude API classification) → either an immediate LINE reply, or an escalation notification to the
owner with the question logged to Supabase.

A separate admin screen (also on Vercel) lets the owner edit FAQ content and send broadcast
messages from a phone browser.

**In scope for this phase**: FAQ auto-response (5 common questions), escalation notification,
mobile-friendly admin screen, broadcast messaging.
**Explicitly out of scope**: reservation/booking features and customer record/payment features
(deferred to a possible Phase 2) — do not build these unless asked.

## Working conventions

- **Browser testing**: only run browser-based testing (e.g. opening the admin screen or bot flow
  in a browser) when the user explicitly asks for it. Do not trigger it proactively after code
  changes.
- **Explanations**: when the user asks for an explanation during development, explain it in a way
  a beginner can understand — avoid unexplained jargon, spell out *why*, not just *what*.
- **Implementation order**: implement one feature at a time (e.g. FAQ auto-response, then
  escalation, then admin screen, then broadcast) rather than building multiple features in
  parallel. Finish and confirm one before moving to the next.

## Subagents (`.claude/agents/`)

Three subagents are preconfigured for this project (all `model: sonnet`):

- **code-reviewer** — reviews changes for correctness, security (secrets, webhook signature
  verification, reply/push token misuse), and unnecessary complexity.
- **test-runner** — detects and runs the test suite once one exists; reports root causes for
  failures without modifying source itself.
- **debugger** — investigates errors/crashes/unexpected behavior, focusing on LINE webhook
  validation, env vars, and API request/response shape mismatches.
