# Baytkeep

**A private home inventory app for iOS.** Remember everything you own — where it is, whether it works, and when food expires — so you never buy a duplicate, forget what's broken, or waste groceries.

Built with React Native, Expo, and TypeScript. All data stays on the device: no account, no cloud, no tracking.

---

## Features

- **Catalog belongings by location** — house, shed, fridge, storage, anywhere, with optional rooms
- **Instant search** across everything you own
- **Status tracking** — mark items working or broken (broken items are flagged in red)
- **Photos** — snap pictures of items and warranty papers
- **Food & expiry** — track expiry and "runs out" dates for fridge/pantry items
- **Smart reminders** — local notifications before food expires, timed proportionally to shelf life
- **Shopping lists** — checklists for what you need to buy, with optional reminder dates
- **Needed / wishlist** — track things you want but don't own yet
- **Private by design** — everything is stored locally with AsyncStorage; nothing leaves your phone

## Tech Stack

| Area | Technology |
|------|-----------|
| Framework | React Native |
| Toolchain | Expo (EAS Build) |
| Routing | expo-router (file-based) |
| Language | TypeScript |
| Storage | AsyncStorage (device-local) |
| Fonts | Poppins (@expo-google-fonts) |
| Notifications | expo-notifications |

## Architecture

- **No backend** — fully offline, no servers, no API, no accounts
- **State** — React Context providers per domain (inventory, lists, needed)
- **Persistence** — serialized AsyncStorage with a save queue to prevent race conditions
- **Custom notification timing** — reminders scale to how long an item has:
  `notifyAt = target − (target − dateAdded) × 0.15`

## Project Structure

```
src/
├── app/                  # Screens (expo-router)
│   ├── (tabs)/           # Tab screens: inventory, lists
│   ├── item/[id].tsx     # Item detail
│   ├── add-item.tsx
│   ├── manage-locations.tsx
│   ├── settings.tsx
│   └── welcome.tsx       # First-launch onboarding
├── components/           # Reusable UI (segmented controls, dropdown, etc.)
├── context/              # State providers
├── lib/                  # Storage, notifications, utils
└── types/                # TypeScript definitions
```

## Running Locally

```bash
npm install
npx expo start
```

Requires an [Expo dev build](https://docs.expo.dev/develop/development-builds/introduction/) (uses native modules like gesture-handler and linear-gradient).

## Status

Home-inventory app built with an AI-assisted workflow. Available on the App Store (iOS) and in closed testing on Google Play.

---

Made by **AAYHtech** · Developed by **Ahmed Aldarwish**
