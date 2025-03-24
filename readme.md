# BDO Market Discord Bot

This Discord bot tracks specified items in the Black Desert Online (BDO) marketplace and sends notifications to a Discord channel when they are listed at a low price.

## 🚀 Features

✅ Real-time data retrieval from **BDO Market API**\
✅ Users can save items they want to track in the database\
✅ Sends special notifications for **items that reach a specified price threshold**\
✅ Sends **mention-based messages** to users in their dedicated Discord channel\
✅ Supports PostgreSQL database\
✅ **Each user can have a different tracking list**

## 🛠️ Setup

### 1️⃣ Requirements

Make sure you have the following tools installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [PostgreSQL](https://www.postgresql.org/)
- [Git](https://git-scm.com/)

### 2️⃣ Clone the Project

```sh
git clone https://github.com/your-username/bdo-market-bot.git
cd bdo-market-bot
```

### 3️⃣ Install Dependencies

```sh
npm install
```

### 4️⃣ Configure the .env File

Before running the project, create a `.env` file and add the following details:

```env
TOKEN=your_discord_bot_token
DATABASE_URL=your_postgresql_connection_string
```

### 5️⃣ Run the Bot

```sh
node index.js
```

## 🎮 Usage

### 🔎 Commands

| Command             | Description                                                                 |
|--------------------|------------------------------------------------------------------------------|
| `/ping`           | Checks if the bot is online and responsive.                                   |
| `/marketqueue`    | Lists currently queued items in the Black Desert Online market.               |
| `/trackeditems`   | Displays the user's tracked items stored in the database.                     |
| `/setup`          | Creates a private channel for the user to receive market notifications.       |
| `/deletetrackeditem` | Allows the user to remove a tracked item from the database.                |
| `/trackitem`      | Adds an item to the user's tracked list for market notifications.             |
| `/alltrackableitems` | Shows a list of all items that can be tracked in the market.               |
 
## 🛠️ Technologies Used

- **Discord.js v14** (Interacts with the Discord API)
- **Node.js** (Server-side JavaScript)
- **PostgreSQL** (Database management)
- **Axios** (Fetches data from the BDO Market API)

## 🤝 Contributing

If you want to contribute:

1. Fork this repository.
2. Create a new branch: `git checkout -b new-feature`
3. Make your changes and commit: `git commit -m "Added a new feature"`
4. Push to your branch: `git push origin new-feature`
5. Open a **Pull Request**.

## 📜 License

This project is licensed under the **MIT License**.


## Terms of Service

Last Updated: March 24, 2025

## 1. Introduction

Welcome to the [Black Desert Market Tracker] Discord bot. This Terms of Service document governs your use of the Bot, which provides market queue notifications for Black Desert Online (BDO) through an API. By using this Bot, you agree to comply with these terms.

## 2. Description of Service

The Bot is designed to track market queue items in Black Desert Online and send notifications through Discord. It fetches real-time data from an external API and notifies users when their tracked items meet specified conditions.

## 3. Limitations and Acceptable Use

By using this Bot, you agree to:

Use the Bot solely for personal and non-commercial purposes.

Not attempt to reverse-engineer, modify, or exploit the Bot beyond its intended use.

Avoid excessive API requests that could lead to rate limiting or disruption of services.

Comply with Discord's Terms of Service and GitHub's Terms of Service.

Comply with Black Desert Online’s Terms of Service, including any rules regarding automated data collection, bot usage, and third-party software.

## 4. Disclaimer

The Bot is provided "as is" without any warranties. The developer does not guarantee accuracy, uptime, or uninterrupted service.

The Bot relies on third-party APIs, and availability or changes to these APIs may affect functionality.

The developer is not responsible for in-game transactions or decisions based on Bot notifications.

Use of this Bot is at your own risk. Violating Black Desert Online’s Terms of Service could result in penalties, including account suspension or bans.

## 5. Privacy

The Bot may store limited user data, such as tracked items and notification settings, to enhance user experience.

No personal or sensitive data is collected, stored, or shared with third parties.

Users can request data deletion at any time.

## 6. Changes to Terms

The developer reserves the right to modify these terms at any time. Users will be notified of major updates through the GitHub repository or Discord.

## 7. Contact

For questions or issues, please create an issue on the GitHub repository or contact the developer via Discord.

By using this Bot, you acknowledge that you have read, understood, and agreed to these terms.



