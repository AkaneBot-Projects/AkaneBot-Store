---
<h1 align="center">AR BASE WHATSAPP BOT</h1>
---

# AR-BASE

**AR-BASE** is a WhatsApp bot designed to auto-reply. It uses the **Baileys** library to interact with the WhatsApp Web API and is easy to set up and use.

## Features

- Light and efficient performance.
- Command system that supports various functions.

## Table of Contents

- [Configurasi](#Configurasi)
- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Directory Structure](#directory-structure)
- [Dependencies](#dependencies)
- [TQTO](#TQTO)
- [License](#license)

## Configurasi

To configure the bot, you need to create a `.env` file in the project's root directory. This file contains all the environment variables needed to run the bot properly. You can use

### Steps:

1. **Copy files `.env.example`:**
   Inside the project's root directory, find a file named `.env.example`. Copy this file and rename it `.env`.

```bash
cp .env.example .env
```

2. **Fill in the environment variables:**
   Open the `.env` file you just created and fill in the values in the file.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Arifzyn19/AR-BASE.git
cd AR-BASE
```

2. Install the dependencies:

```bash
npm install
```

### Usage

To start the bot, use the following command:

```bash
npm start
```

Alternatively, you can use PM2 for process management:

```bash
npm run pm2
```

## Scripts

`start:` Starts the bot with a specified memory limit.

```bash
npm start
```

`pm2:` Starts the bot using PM2 with a specified name and memory limit.

```bash
npm run pm2
```

`restart:pm2:` Restarts the bot managed by PM2.

```bash
npm run restart:pm2
```

`stop:pm2:` Stops the bot managed by PM2.

```bash
npm run stop:pm2
```

### Directory Structure

```
├── LICENSE
├── README.md
├── eslint.config.js
├── package-lock.json
├── package.json
├── commands
├── src
│   ├── configs
│   │   ├── config.js
│   │   ├── database.js
│   │   ├── helper.js
│   │   ├── localdb.js
│   │   └── plugins.js
│   ├── events
│   │   ├── connection.js
│   │   ├── groups.js
│   │   └── messages.js
│   ├── handler.js
│   ├── index.js
│   └── lib
│       ├── client.js
│       ├── color.js
│       ├── emoji.js
│       ├── function.js
│       ├── serialize.js
│       └── sticker.js
└── temp
```

# TQTO

TQTO (Thanks To) is a part of this project to give appreciation to those who have contributed, provided assistance, or inspiration in the development of this project.

## Thank You List

Thank you to the following individuals, communities and organizations who have helped us:

### Developers & Contributors

- [**ArifzynXD**](https://github.com/Arifzyn19) - Lead developer and project owner, responsible for the main development and overall direction of the project.
- [**AmirulDev**](https://github.com/amiruldev20) - Provided inspiration and valuable insights, especially in building bot functionalities using libraries like Baileys.
- [**DikaArdnt**](https://github.com/DikaArdnt) - Some parts of the codebase were inspired and adapted from his projects, particularly for bot features and backend structure.

### LICENSE

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
