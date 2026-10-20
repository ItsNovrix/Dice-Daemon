# 🎲 Dice Daemon

An automated dice-rolling bot for Reddit!

## 🛠️ How It Works

Dice Daemon listens to the subreddit's comment stream in real-time. When a user calls the rolling command using standard tabletop RPG notation, Dice Daemon calculates the random generation and replies instantly with the results of the roll.

### Syntax
`!roll [Number of Dice]d[Number of Sides]`

* **Example:** `!roll 1d6` 
  * *Response:* Results: [ 4 ] | **Total: 4**
* **Example:** `!roll 3d20` 
  * *Response:* Results: [ 18, 4, 12 ] | **Total: 34**

### Roll Modifiers

* **Addition/Subraction:** Add or subtract modifiers from dice totals.
  * **Example:** `!roll 3d20+5` or `!roll 3d20-2`
* **Keep Highest/Lowest:** Roll multiple dice and keep a specified number of the highest or lowest results.
  * **Example:** `!roll 10d20kh3` or `!roll 15d20kl2`
* **Exploding Dice:** Use `!` for one bonus roll when a die reaches its maximum, or `!!` for chained bonus rolls.
  * **Example:** `!roll 2d5!` or `!roll 3d6!!`

## 🛡️ Built-In Protections

To keep the subreddit clean and prevent performance crashes, the core logic includes standard safety rails:
* **Dice Cap:** Maximum of 20 dice rolled per comment.
* **Side Cap:** Maximum of 100 sides per die.
* **Modifier Cap:** Modifiers capped at ±1,000,000, and bonus rolls at 100.
* **Input Validation:** Automatically ignores negative numbers, zeroes, or non-numeric spam.

---

## 🧾 Source & License

The source code for Dice Daemon is available on [GitHub](https://github.com/ItsNovrix/Dice-Daemon).

This project is licensed under the [BSD-3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
This app was developed in compliance with [Reddit's Developer Terms](https://developers.reddit.com/apps/relay-app/developer-settings) and adheres to the guidelines for the Devvit platform.

---

## 🆘 Feedback & Support

If you have any feedback/suggestions or need support, visit [r/NovrixApps](https://www.reddit.com/r/NovrixApps).

---

## 📋 App Development

Track upcoming features, planned updates, and known issues for all my Devvit apps on the [Novrix Labs Trello Board](https://trello.com/b/1TdocvRg/novrix-labs).

---

## Changelog

* v0.0.1: Initial code upload.
* v0.0.2: Updated bot comment formatting.
* v0.0.3: Updated GitHub source code link.
* v0.0.4: Updated main code, updated README.
* v0.0.5: Updated app to latest Devvit release.
* v0.0.6: Added app profile icon.
* v0.0.7: Manual file version bump due to Devvit CLI issue.
* v0.0.8: Manual file version bump due to Devvit CLI issue.
* v0.0.9: Updated app triggers to address trigger issues.
* v0.0.10: Updated assets to address app icon issue.
* v0.0.11: Removed old configuration files, began transitioning app to new architecture.
* v0.0.12: Fixed issues with bot not responding to roll commands.
* v0.0.13: Completed the full transition to new architecture and updated app icon.
* v0.0.14: Updated app to latest Devvit version.
* v0.0.15: Updated app to latest Devvit version.
* v0.0.16: Updated app to latest Devvit version.
* v0.0.17: Updated app to latest Devvit version.
* v0.0.18: Updated support subreddit link.
* v0.0.19: Updated app to latest Devvit version.
* v0.0.20: Updated app to latest Devvit version.
* v0.0.21: Updated app to latest Devvit version and added roll modifiers.
* v0.0.22: Updated app to latest Devvit version.

Thanks for using **Dice Daemon**!