# Phase 1 — Planning

## Product

SpecBattle is a web application that compares Android phones using structured specifications and a transparent scoring system.

## Problem

People often argue about which Android phone is better based on opinions, brands, or isolated specifications. SpecBattle provides a structured way to compare two phones and understand the result.

## Core Flow

Select Phone A → Select Phone B → Start Battle → Compare specs → Calculate category scores → Determine overall winner → Share result.

## MVP Scope

### Included
- Android phones as the comparison products
- Phone database
- Phone search
- Two-phone selection
- Specification comparison
- Category winners
- Overall scoring
- Battle result
- Shareable result
- Admin management of phone data

### Excluded
- iPhones/iOS comparisons
- Native Android application
- Phone purchasing
- Social network features
- Comments/chat
- Community voting
- Advanced user accounts

## Success Criterion

A user can choose two Android phones, run a battle, understand why one phone won, and share the result.

## Key Decisions Still Requiring Approval

1. Whether the scoring model uses specifications only or also benchmark/real-world data.
2. Whether categories have equal or weighted importance.
3. Whether price affects only Value or also the overall score.

## Planned Stack

Next.js, TypeScript, React, Tailwind CSS, PostgreSQL, Prisma, and Vercel.
