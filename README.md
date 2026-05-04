# BrutalGames

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge\&logo=react)
![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge\&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge\&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-Lang-3178C6?style=for-the-badge\&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-black?style=for-the-badge)

A neo-brutalist real-time multiplayer gaming platform built with React, Vite, and Supabase.

---

## Overview

BrutalGames is a modular multiplayer system featuring real-time rooms, persistent stats, and username-based authentication. It is designed for scalability, low latency gameplay, and easy game expansion.

---

## Tech Stack

* React 19
* Vite
* TypeScript
* Tailwind CSS
* Supabase (PostgreSQL + Realtime)
* Motion
* Lucide Icons

---

## Features

* Real-time multiplayer rooms
* Username-based authentication (no email required)
* Live leaderboard with win tracking
* Match history system
* JSON-based move storage
* Neo-brutalist UI design system
* Trigger-based backend automation
* Scalable database architecture

---

## Games Included

* Tic Tac Toe
* Connect 4
* Gomoku
* Rock Paper Scissors
* Reaction Speed Test
* Memory Match
* Typing Race

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/brutalgames.git
cd brutalgames
```

---

### 2. Supabase Setup

Create a project at Supabase and copy:

* Project URL
* Anon Key

---

### 3. Database Setup

Run `schema.sql` inside Supabase SQL Editor.

This creates:

* profiles
* games
* rooms
* moves
* game_results
* leaderboard
* triggers
* indexes

---

### 4. Environment Variables

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

### 5. Install & Run

```bash
npm install
npm run dev
```

---

## Architecture

### Database Layer

* PostgreSQL schema-based structure
* Trigger-driven leaderboard updates
* Indexed queries for performance

### Realtime Layer

* Supabase Realtime subscriptions
* Live room and move sync

### Auth Layer

* Username-only authentication
* Auto profile creation
* Local storage session persistence

---

## Project Structure

```
src/
  components/   UI components
  games/        Game logic
  hooks/        Custom hooks
  lib/          Supabase client
  pages/        App screens
  App.tsx       Router
  main.tsx      Entry point
schema.sql      Database schema
.env.example    Environment template
```

---

## Deployment

### Vercel

```bash
git push origin main
```

Add environment variables in dashboard.

---

### Production Build

```bash
npm run build
```

Output: `dist/`

---

## Troubleshooting

### 401 Unauthorized

Check Supabase URL and anon key.

### Permission denied for schema public

```sql
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
```

### Empty UI / No Data

* Ensure schema.sql executed successfully
* Enable Supabase Realtime
* Verify correct project connection

---

## Roadmap

* Full game logic expansion
* Multiplayer synchronization improvements
* Chat system
* Tournament mode
* Mobile optimization
* Anti-cheat system
