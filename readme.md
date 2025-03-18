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

### 5️⃣ Set Up the Database

If your database is not yet set up, execute the following SQL command to create the `tracked_items` table:

```sql
CREATE TABLE tracked_items (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    "mainCategory" INTEGER NOT NULL,
    enhancementLevel INTEGER NOT NULL,
    target_price BIGINT NOT NULL,
    user_id TEXT NOT NULL
);
```

### 6️⃣ Run the Bot

```sh
node index.js
```

## 🎮 Usage

### 📌 Add the Bot to Your Server

Use the following OAuth2 URL to add the bot to your Discord server:

```
https://discord.com/oauth2/authorize?client_id=YOUR_BOT_CLIENT_ID&permissions=bot_permissions&scope=bot
```

### 🔎 Commands

| Command        | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| `/ping`       | Checks if the bot is running                                               |
| `/marketqueue` | Lists tracked items                                                        |
| `/trackeditems` | Displays tracked items stored in the database                            |
| `/setup`      | Creates a dedicated channel for the user and sends item notifications there |

## 🛠️ Technologies Used

- **Discord.js v14** (Interacts with the Discord API)
- **Node.js** (Server-side JavaScript)
- **PostgreSQL + NeonDB** (Database management)
- **Axios** (Fetches data from the BDO Market API)
- **Google Cloud Run** (Keeps the bot running 24/7)

## 🤝 Contributing

If you want to contribute:

1. Fork this repository.
2. Create a new branch: `git checkout -b new-feature`
3. Make your changes and commit: `git commit -m "Added a new feature"`
4. Push to your branch: `git push origin new-feature`
5. Open a **Pull Request**.

## 📜 License

This project is licensed under the **MIT License**.

