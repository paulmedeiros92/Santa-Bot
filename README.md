# Santa-Bot

A fun Christmas karma bot for Discord in Node.js

Requirements:
THIS NEEDS TO BE UPDATED

- A Sqlite database, that the bot will initialize when it makes a connection to the correct database path
- A Discord authorization token passed in as the first node argument

Libraries:

- discord.js library to interact with discord
- sqlite3 library to handle the slq commands

Features:

- Wishlist tracking for users
- Karma Tracking along with Naughty, Nice, and Ninja roles
- Private role specific channels
- Custom emoji for each role

Roles:

- Bot role needs to be above the naughty nice and ninja roles to be able to manipulate them
- Message content intent needs to be toggled in the bot page on discord console
