# NX_Bot
Bot discord allowing the search for Nintendo Switch games based on scraping of the site NXBrew

# How to configure it ?

Download the github repo by doing `git clone https://github.com/THZoria/NX_Bot.git` (Requires git to be installed on your device) Or maybe clicked code button `download ZIP`

This bot requires Node JS version 16 and a good machine with at least 8GB of RAM
You must install the node js modules by doing `"npm install -i"`.

Added the discord token in the `.env`

- NXBot now uses the slash control system imposed by discord to use the new API, for the used and search for a game you have to do `/nxbrew game name`.
- You can also search for 3DS games with the command `/ghosteshop game name`.
Also added the command `/cdn ame name`.

This command uses a json file that you have to host yourself, you can base it on the [template.json](https://github.com/THZoria/NX_Bot/blob/main/template.json) file and edited line 11 of the [cdn command](https://github.com/THZoria/NX_Bot/blob/main/commands/warez/CDN.js#L11)

![nxbrew command](https://user-images.githubusercontent.com/50277488/174673960-86d3c01d-d370-459a-80e8-b7f2bd7f3b3c.png)

![ghosteshop command](https://user-images.githubusercontent.com/50277488/174674114-c2bd3a4f-8a6d-4090-8c8b-e9a2cf33139b.png)

![cdn command](https://user-images.githubusercontent.com/50277488/174674056-1213557c-4579-43e0-8c93-26b4850e4e13.png)



# Licence

[![License: GPL v2](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://github.com/THZoria/AtmoPack-Vanilla/blob/main/LICENCE)

# Discord

[![Discord](https://img.shields.io/discord/643436008452521984.svg?logo=discord&logoColor=white&label=Discord&color=7289DA)](https://discord.com/invite/4YkUZvC)

# Crédit 

Thanks [Murasaki](https://github.com/MurasakiNX) for the work on the bot
