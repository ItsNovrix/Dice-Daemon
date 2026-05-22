# 🎲 Dice Daemon

An automated dice-rolling bot for Reddit!

## 🛠️ How It Works

Dice Daemon listens to the subreddit's comment stream in real-time. When a user calls the rolling command using standard tabletop RPG notation, Dicr Daemon calculates the random generation and replies instantly.

### Syntax
`!roll [Number of Dice]d[Number of Sides]`

* **Example:** `!roll 1d6` 
  * *Response:* Results: [ 4 ] | **Total: 4**
* **Example:** `!roll 3d20` 
  * *Response:* Results: [ 18, 4, 12 ] | **Total: 34**

## 🛡️ Built-In Protections

To keep the subreddit clean and prevent performance crashes, the core logic includes standard safety rails:
* **Dice Cap:** Maximum of 20 dice rolled per comment.
* **Side Cap:** Maximum of 100 sides per die.
* **Input Validation:** Automatically ignores negative numbers, zeroes, or non-numeric spam.

---

## 🧾 Source & License

The source code for the Relay App is available on [GitHub](https://github.com/ItsNovrix/relay-app).

This project is licensed under the [BSD-3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
This app was developed in compliance with [Reddit's Developer Terms](https://developers.reddit.com/apps/relay-app/developer-settings) and adheres to the guidelines for the Devvit platform.

---

## 🆘 Feedback & Support

If you have any feedback/suggestions or need support, DM [u/ItsNovrix](https://www.reddit.com/u/ItsNovrix).

---

## Changelog

* v0.0.1: Initial code upload.
* v0.0.2: Updated bot comment formatting.