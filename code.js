/* CONFIG FILE START */
const config = require('./settings/config.json');
/* CONFIG FILE END */

/* PACKAGES START */
const Discord = require('discord.js');
const bot = new Discord.Client();
const snekfetch = require('snekfetch');
const rbx = require('noblox.js');
await rbx.cookieLogin(`${config.rblxCookie}`)
const firebase = require("firebase");
const firebaseConfig = {
    databaseURL: `${config.fireBaseURL}`,
  };
firebase.initializeApp(firebaseConfig)
/* PACKAGES END */


bot.on('ready', () => {
  console.log('Turned on Discord bot');
  bot.user.setActivity(`${bot.users.size} comrades!`, { type: 'WATCHING' });
  bot.channels.get(bot.channels.get(`${config.mainChatChannelID}`).id).send(`**Resuming processes!** :wave:`)
})

bot.on('message', async message => {

  const args = message.content.split(/[ ]+/)
  const verifiedRole = message.guild.roles.find(role => role.name === `${config.verified_role_name}`);
  const verificationCode = ['apple', 'rain', 'dog', 'cat', 'food','yum','pizza','raindrop','snow','birthday','cake','burger','soda','ice','no','yes','orange','pear','plum'];
  const promoLogs = bot.channels.get(`${config.xpAuditLogChannelID}`)
  const officerRole = message.guild.roles.find(role => role.name === `${config.officer_role_name}`);
  const groupFunction = await bloxyClient.getGroup(config.groupID)


  if (message.author.bot) return;
  if (message.channel.type === "dm") return;



  if (message.content.toLowerCase().startsWith(`${config.prefix}commands`)){
    var first = new Discord.RichEmbed()
      .setColor(0x1279ff)
      .setTitle(`__Member Commands__`)
      .setDescription(`The following commands can be ran by: *everyone*.`)
      .addField(`**\`${config.prefix}prefix\`**`, `Returns the current prefix set for the guild.`)
      .addField(`**\`${config.prefix}commands\`**`, `Displays this menu`)
      .addField(`**\`${config.prefix}verify\`**`, `Associates a user's ROBLOX account with their Discord 
        account through verification procedures.`)
      .addField(`**\`${config.prefix}view username\`**`, `Views ${config.xpName} information about the 
        given username (\`username\`).`)
    await message.author.send(first);
    var second = new Discord.RichEmbed()
      .setColor(0xff6b4a)
      .setTitle(`__Officer Commands__`)
      .setDescription(`The following commands can be ran by: *officers*.`)
      .addField(`**\`${config.prefix}${config.xpName} add 1 username1, username2, username3, 
        etc\`**`, `Adds 1 ${config.xpName} to the usernames provided (\`username1, username2, username3, etc\`).`)
      .addField(`**\`${config.prefix}${config.xpName} remove 1 username1, username2, username3, etc\`**`, `Removes
       1 ${config.xpName} to the usernames provided (\`username1, username2, username3, etc\`).`)
    await message.author.send(second);
    var third = new Discord.RichEmbed()
      .setColor(0xffffff)
      .setTitle(`__Owner Commands__`)
      .setDescription(`The following commands can be ran by: *owner*.`)
      .addField(`**\`${config.prefix}setup\`**`, `Sets up the guild with all of the information found in the config.json file (./settings/config.json).`)
    return await message.author.send(third);
  }

  if (message.content.toLowerCase().startsWith(`${config.prefix}verify`)){
    if (!message.guild.members.get(bot.user.id).hasPermission("MANAGE_NICKNAMES")){
      return message.channel.send(`Sorry ${message.author}, but I don't have permissions to manage 
        nicknames.\n**Please contact someone to change my permissions so I can manage nicknames!**`)
        .then(message => message.delete(5000));
    }else if (!message.guild.members.get(bot.user.id).hasPermission("CHANGE_NICKNAME")){
      return message.channel.send(`Sorry ${message.author}, but I don't have permissions to change nicknames.
        \n**Please contact someone to change my permissions so I can change nicknames!**`).then(message => 
        message.delete(5000));
    }else if (!verifiedRole){
      return message.channel.send(`Sorry ${message.author}, but this guild is missing the 
        \`${config.verified_role_name}\` role!\n**Please contact someone to add the role!**`)
        .then(message => message.delete(5000));
    }else if (message.member.roles.exists("name", `${config.verified_role_name}`)){
      return message.channel.send(`Sorry ${message.author}, but you're already verified!`)
      .then(message => message.delete(5000));
    }else if (!args[1]){
      return message.channel.send(`Sorry ${message.author}, but you need to provide me 
        with a ROBLOX username.`).then(message => message.delete(5000));
    }else{
      var { body } = await snekfetch.get(`https://verify.eryn.io/api/user/${message.author.id}`);

      if (body.status == "ok"){
        var statusOK = new Discord.RichEmbed()
          .setColor(0x3eff97)
          .setTitle(`Verification`)
          .setDescription(`Fetched data from RoVer, nice to meet you **${body.robloxUsername}**! :smiley:`)


        var rblx_user_ID = body.robloxId;
        var rblx_username = body.robloxUsername;
        var rank_number = await rbx.getRankInGroup(config.groupID, rblx_user_ID);

        /*
          FEATURE:
          Delete the commented portion of the code if you want roles and nicknames to change IF
          the user is in the group
        */

        /* if (rank_number > 0){ */
          await message.member.addRole(verifiedRole);
          await message.member.setNickname(`${rblx_username}`);
          return message.author.send(`${config.welcomeMessage}`);
        /* } */
      }else{
        var { body } = await snekfetch.get(`http://api.roblox.com/users/get-by-username?username=${args[1]}`);
        
        if (body.errorMessage === "User not found"){
          return message.channel.send(`Sorry ${message.author}, but could you please provide 
            me with a real ROBLOX username?`).then(message => message.delete(5000));
        }

        var verifyCode = `${verificationCode[Math.floor(Math.random() * verificationCode.length)]} 
        ${verificationCode[Math.floor(Math.random() * verificationCode.length)]} ${verificationCode[Math.floor(Math.random() * 
          verificationCode.length)]} ${verificationCode[Math.floor(Math.random() * verificationCode.length)]}`;


        const statusCode = [`RBLX-${verifyCode}`];
        const token = statusCode[Math.floor(Math.random() * statusCode.length)];

       

        const location = await message.author.send(goodMessage).then(msg => msg.channel).catch(() => {
          return message.channel.send(`Sorry ${message.author}, but I couldn't direct message you!`)
          .then(message => message.delete(5000));
        })

        const timeCollectionThing = { max: 1, time: 300000, errors: ['time'] };
        const collected = await location.awaitMessages(response => message.author === response.author && 
          response.content === 'done', timeCollectionThing).catch(() => null);
        if (!collected) {
          return message.channel.send(`Sorry ${message.author}, but I've waited patiently for five minutes and you haven't chatted 
            **\`done\`**--I've cancelled the verification process.`).then(message => message.delete(5000));
        }

        const statusChange = await rbx.getStatus(await rbx.getIdFromUsername(args[1]));
        const blurbChange = await rbx.getBlurb(await rbx.getIdFromUsername(args[1]));
        var rblx_user_ID = await rbx.getIdFromUsername(args[1]);
        var rblx_username = await rbx.getUsernameFromId(rblx_user_ID);
        var rank_number = await rbx.getRankInGroup(config.groupID, rblx_user_ID)

        /*
          **FEATURE**
          If you want users to be verified ONLY if they're in the group, then uncomment where commented
        */
        if ((statusChange === token || blurbChange === token) /*&& (rank_number > 0)*/){
          await message.member.addRole(verifiedRole);
          await message.member.setNickname(`${rblx_username}`);
          return message.author.send(`${config.welcomeMessage}`);
        }/*else if (rank_number == 0){
          return message.author.send(`Sorry, but I can't verify you because you're **not** in the group!\n
            Please join the group and rerun the verification command!`);
        }*/else{
          return message.channel.send(`Sorry ${message.author}, but I couldn't find the code on your blurb 
            or status.`).then(message => message.delete(5000));
        }
      }
    }
  }

  if (message.content.toLowerCase().startsWith(`${config.prefix}view`)){
    if (!args[1]){
      return message.channel.send(`Sorry ${message.author}, but you're missing the first argument--the username!\n**\`${config.prefix}view username1\`**`).then(message => message.delete(5000));
    }

    var { body } = await snekfetch.get(`http://api.roblox.com/users/get-by-username?username=${args[1]}`)
    if (body.errorMessage === "User not found"){
      return message.channel.send(`Sorry ${message.author}, but you gave me an invalid username!\n**\`${config.prefix}view username1\`**`).then(message => message.delete(5000));
    }
    var userID = body.Id


    var { body } = await snekfetch.get(`https://www.roblox.com/headshot-thumbnail/json?userId=${userID}&width=180&height=180`);
    var mugShot = `${body.Url}`


    var {body} = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`)
    var currentXP;

    if (!body){
      return message.channel.send(`Sorry ${message.author}, but the username that you provided me isn't registered in my database yet.`).then(message => message.delete(5000))
    }else{

      currentXP = body.xpValue
      var currentRankID = await rbx.getRankInGroup(config.groupID, userID)
      var requiredXP;
      var usernameHeader = `[${args[1].toLowerCase()}](https://www.roblox.com/users/${userID}/profile)`
      var currentRankAndPoints;
      var currentRankName;
      var nextRankName;

      var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)
      console.log(`errors here1`)
      if ((0 < currentRankID) && (currentRankID < 255)){
        for (i = 1; i < body.roles.length; i++){
          if (body.roles[i].rank === currentRankID){
            currentRankName = body.roles[i].name
            nextRankNumber = body.roles[i+1].rank
            nextRankName = body.roles[i+1].name
            var {body} = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`)
            currentRankAndPoints = `**${currentRankName} - Currently has ${body.xpValue} ${config.xpName.toUpperCase()}**`
            var {body} = await snekfetch.get(`${config.fireBaseURL}/roles/${nextRankNumber}.json`)
            requiredXP = body.requiredXP
            break
          }
        }
      }else if (currentRankID === 255){
        currentRankName = await rbx.getRankNameInGroup(config.groupID, userID)
        var {body} = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`)
        currentRankAndPoints = `**${currentRankName} - Currently has ${body.xpValue} ${config.xpName}**`
        requiredXP = 0
        nextRankName = "??"
      }else{
        currentRankName = "Guest"
        currentRankAndPoints = `**${currentRankName} - Currently has 0 ${config.xpName.toUpperCase()}**`
        requiredXP = 0
        nextRankName = `[Join Group](https://www.roblox.com/groups/${config.groupID})`
      }



      var percentAge = Math.round(((Number(currentXP))/Number(requiredXP)) * 100)
      if (Number.isNaN(percentAge)){
        percentAge = 0
      }
      if (percentAge > 100){
        percentAge = 100
      }

      var percentBar;
      if (percentAge === 0){
        percentBar = ":white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:"
      }else if (0 <= percentAge && percentAge <= 10){
        percentBar = ":white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:"
      }else if (10 <= percentAge && percentAge <= 20){
        percentBar = ":white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:"
      }else if (20 <= percentAge && percentAge <= 30){
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:"
      }else if (30 <= percentAge && percentAge <= 40){
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:"
      }else if (40 <= percentAge && percentAge <= 50){
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button: :white_square_button:"
      }else if (50 <= percentAge && percentAge <= 60){
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button: :white_square_button:"
      }else if (60 <= percentAge && percentAge <= 70){
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button: :white_square_button:"
      }else if (70 <= percentAge && percentAge <= 80){
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button: :white_square_button:"
      }else if (80 <= percentAge && percentAge <= 90){
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_square_button:"
      }else{
        percentBar = ":white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square: :white_large_square:"
      }
      var remainingErrorNumber = Number(requiredXP-Number(currentXP))
      if ((remainingErrorNumber < 0) || (remainingErrorNumber === 0)){
        remainingErrorNumber = "Due 4 Promotion";
      }

      var remainingError = `**${remainingErrorNumber}** ${config.xpName.toUpperCase()} remaining for **${nextRankName} (${requiredXP} ${config.xpName.toUpperCase()})**`


      var response = new Discord.RichEmbed()
        .setColor(0x45ff9f)
        .setThumbnail(`${mugShot}`)
        .setDescription(`${usernameHeader}\n${currentRankAndPoints}\n${percentBar} ${percentAge}%\n${remainingError}`)
      return message.reply(response).then(message => message.delete(30000))
    }
  }

  if (message.content.toLowerCase().startsWith(`${config.prefix}github`)){
    var embed = new Discord.RichEmbed()
      .setColor(0xff3636)
      .setDescription(`**[Video Tutorial](https://github.com/nishi7409/ClanLabsV2-OpenSourced)**`)
    await message.channel.send(embed)
    var embed = new Discord.RichEmbed()
      .setColor(0x3072ff)
      .setDescription(`**[Source Code](https://github.com/nishi7409/ClanLabsV2-OpenSourced)**`)
    await message.channel.send(embed)
    var embed = new Discord.RichEmbed()
      .setColor(0x1cff8e)
      .setDescription(`This project was developed by [Nishant Srivastava](https://www.github.com/nishi7409).`)
    return await message.channel.send(embed)
  }

  if (message.content.toLowerCase().startsWith(`${config.prefix}${config.xpName}`)){
    if (!message.member.roles.exists("name", `${config.officer_role_name}`)){
      return message.channel.send(`Sorry ${message.author}, but only users with the 
        **\`${config.officer_role_name}\`** can run that command!`).then(message => message.delete(5000));
    }else if (!args[1]){
      return message.channel.send(`Sorry ${message.author}, but you're missing the first 
        argument--add or remove?\n**Adding ${config.xpName}: \`${config.prefix}${config.xpName} add 1 username1, 
        username2, username3...\`\nRemoving ${config.xpName}: \`${config.prefix}${config.xpName} remove 1 username1, 
        username2, username3...\`**`).then(message => message.delete(5000));
    }else if (args[1].toLowerCase() !== "add" && args[1].toLowerCase() !== "remove"){
      return message.channel.send(`Sorry ${message.author}, but you didn't provide me with a correct first argument--
        add or remove?\n**Adding ${config.xpName}: \`${config.prefix}${config.xpName} add 1 username1, username2, username3...
        \`\nRemoving ${config.xpName}: \`${config.prefix}${config.xpName} remove 1 username1, username2, 
        username3...\`**`).then(message => message.delete(5000));
    }else{
      if (!args[2]){
        return message.channel.send(`Sorry ${message.author}, but you're missing the second argument--
          number of ${config.xpName}?\n**Adding ${config.xpName}: \`${config.prefix}${config.xpName} add 1 username1, 
          username2, username3...\`\nRemoving ${config.xpName}: \`${config.prefix}${config.xpName} remove 1 username1, username2, 
          username3...\`**`).then(message => message.delete(5000));
      }else if (isNaN(Number(args[2]))){
        return message.channel.send(`Sorry ${message.author}, but you didn't provide me with a real number.
          \n**Adding ${config.xpName}: \`${config.prefix}${config.xpName} add 1 username1, username2, username3...\`\n
          Removing ${config.xpName}: \`${config.prefix}${config.xpName} remove 1 username1, username2, 
          username3...\`**`).then(message => message.delete(5000));
      }else if (args[2] < 0){
        return message.channel.send(`Sorry ${message.author}, but you need to provide me with a positive 
          number.\n**Adding ${config.xpName}: \`${config.prefix}${config.xpName} add 1 username1, username2, 
          username3...\`\nRemoving ${config.xpName}: \`${config.prefix}${config.xpName} remove 1 username1, username2, 
          username3...\`**`).then(message => message.delete(5000));
      }else if (args[2] > config.maxXP){
        return message.channel.send(`Sorry ${message.author}, but you need to provide mw with a number that's less than 
          the max ${config.xpName}--currently set at ${config.maxXP} ${config.xpName}.\n**Adding ${config.xpName}: 
          \`${config.prefix}${config.xpName} add 1 username1, username2, username3...\`\nRemoving ${config.xpName}: 
          \`${config.prefix}${config.xpName} remove 1 username1, username2, username3...\`**`).then(message => message.delete(5000));
      }else if (!args[3]){
        return message.channel.send(`Sorry ${message.author}, but you're missing the third argument--the 
          usernames!\n**Adding ${config.xpName}: \`${config.prefix}${config.xpName} add 1 username1, username2, 
          username3...\`\nRemoving ${config.xpName}: \`${config.prefix}${config.xpName} remove 1 username1, username2, 
          username3...\`**`).then(message => message.delete(5000));
      }else{

        if (args[1].toLowerCase() === "add"){
          var userArray = message.content.slice(message.content.indexOf(message.content.split(" ")[3])).split(', ');
          for (i = 0; i < userArray.length; i++){
            var { body } = await snekfetch.get(`https://api.roblox.com/users/get-by-username?username=${userArray[i]}`);
            if (body.success === false){
              var errorEmbed = new Discord.RichEmbed()
                .setColor(0xff4040)
                .setDescription(`:warning: **${userArray[i]} doesn't exist on ROBLOX** :warning:`);
                await message.channel.send(errorEmbed);
            }else{
              var userID = await rbx.getIdFromUsername(`${userArray[i]}`);
              var { body } = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`);
              var currentXP;

              if (!body){
                currentXP = 0;
              }else{
                currentXP = Number(body.xpValue);
              }

              var newNumber = Number(args[2]);

              if (!body){
                firebase.database().ref(`xpData/users/${userID}`).set({
                  xpValue: currentXP + newNumber
                })
                var embed = new Discord.RichEmbed()
                  .setColor(0x5aa9fe)
                  .setTitle(`Insertion`)
                  .setDescription(`Inserted and updated **\`${userArray[i].toLowerCase()}\`**'s profile within my database!`)
                await message.channel.send(embed).then(message => message.delete(5000));
                var auditLogEmbed = new Discord.RichEmbed()
                  .setColor(0xff793b)
                  .setTitle(`**Add**`)
                  .setDescription(`**${message.author}** (${message.author.id})\nModified **${newNumber}** 
                    ${config.xpName} for ${userArray[i].toLowerCase()} (${userID})\n\n**Channel:**\n<#${message.channel.id}>`);
                  bot.channels.get(promoLogs.id).send(auditLogEmbed);
              }else{
                var currentRankID = await rbx.getRankInGroup(config.groupID, userID)
                if (currentRankID === 0){
                  var errorEmbed = new Discord.RichEmbed()
                    .setColor(0xff4040)
                    .setDescription(`:warning: **${userArray[i]} isn't in the group!** :warning:`);
                    await message.channel.send(errorEmbed);
                }else{
                  firebase.database().ref(`xpData/users/${userID}`).set({
                    xpValue: Number(currentXP) + Number(args[2])
                  })
                  var embed = new Discord.RichEmbed()
                    .setColor(0x5aa9fe)
                    .setTitle(`Insertion`)
                    .setDescription(`Inserted and updated **\`${userArray[i].toLowerCase()}\`**'s profile within my database!`)
                  await message.channel.send(embed).then(message => message.delete(5000));
                  var auditLogEmbed = new Discord.RichEmbed()
                    .setColor(0xff793b)
                    .setTitle(`**Add**`)
                    .setDescription(`**${message.author}** (${message.author.id})\nModified **${newNumber}** 
                      ${config.xpName.toUpperCase()} for ${userArray[i].toLowerCase()} (${userID})\n\n**Channel:**\n<#${message.channel.id}>`);
                    bot.channels.get(promoLogs.id).send(auditLogEmbed);

                  var { body } = await snekfetch.get(`${config.fireBaseURL}/roles/${currentRankID}.json`);
                  var requiredXPAtCurrentRankID = body.requiredXP

                  var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)
                  console.log('demotion process')
                  for (i = body.roles.length-1; i > 0; i--){
                    console.log(i)
                    var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)
                    var currentRankID = await rbx.getRankInGroup(config.groupID, userID)
                    var bodyRolesRankNum = body.roles[i].rank
                    var bodyRoleRankName = body.roles[i].name
                    var {body} = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`)
                    var currentXP = body.xpValue

                    var { body } = await snekfetch.get(`${config.fireBaseURL}/roles/${currentRankID}.json`);

                    var requiredXPAtCurrentRankID = body.requiredXP
                    console.log(`current ${config.xpName}- ${currentXP}\nrequired ${config.xpName}- ${requiredXPAtCurrentRankID}`)

                    if (Number(currentRankID) === Number(bodyRolesRankNum)){
                      if (currentXP < requiredXPAtCurrentRankID){
                        await rbx.demote(Number(userID))
                        console.log('demoted')
                        var rblxUsername = await rbx.getUsernameFromId(userID)
                        var embed = new Discord.RichEmbed()
                        .setColor(0xeb4034)
                        .setDescription(`Unfortunately, [${rblxUsername}](https://www.roblox.com/users/${userID}/profile) 
                          has been demoted because [${rblxUsername}](https://www.roblox.com/users/${userID}/profile)'s ${config.xpName} 
                          was less than the required amount of ${config.xpName} for the rank of **\`${bodyRoleRankName}\` (${requiredXPAtCurrentRankID})** `)
                        await message.channel.send(embed)
                      }
                    }
                  }

                  var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)
                  console.log('promotion process')

                  for (i = 1; i < body.roles.length-1; i++){
                    console.log(i)
                    var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)

                    if (body.roles[i].rank === Number(currentRankID)){
                      var bodyRolesRankNumber = body.roles[i+1].rank;

                      var {body} = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`)
                      var currentXP = body.xpValue

                      var { body } = await snekfetch.get(`${config.fireBaseURL}/roles/${bodyRolesRankNumber}.json`);
                      if ((Number(body.requiredXP) !== Number(0)) && (currentXP >= body.requiredXP)){
                        console.log('promoted')
                        var rblxUsername = await rbx.getUsernameFromId(userID)
                        var embed = new Discord.RichEmbed()
                        .setColor(0x26ff93)
                        .setDescription(`[${rblxUsername}](https://www.roblox.com/users/${userID}/profile) has been promoted!`)
                        await message.channel.send(embed)
                        await rbx.promote(Number(userID));
                      }
                    }
                  }
                }
              }
            }
          }
        }else{
          var userArray = message.content.slice(message.content.indexOf(message.content.split(" ")[3])).split(', ');
          for (i = 0; i < userArray.length; i++){
            var { body } = await snekfetch.get(`https://api.roblox.com/users/get-by-username?username=${userArray[i]}`);
            if (body.success === false){
              var errorEmbed = new Discord.RichEmbed()
                .setColor(0xff4040)
                .setDescription(`:warning: **${userArray[i]} doesn't exist on ROBLOX** :warning:`);
                await message.channel.send(errorEmbed);
            }else{
              var userID = await rbx.getIdFromUsername(`${userArray[i]}`);
              var { body } = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`);
              var currentXP = 0;

              if (!body){
                currentXP = 0;
              }else{
                currentXP = Number(body.xpValue);
              }

              var newNumber = Number(args[2]);

              if (!body){
                firebase.database().ref(`xpData/users/${userID}`).set({
                  xpValue: 0
                })
                var embed = new Discord.RichEmbed()
                  .setColor(0x5aa9fe)
                  .setTitle(`Insertion`)
                  .setDescription(`Inserted and updated **\`${userArray[i].toLowerCase()}\`**'s profile within my database!`)
                await message.channel.send(embed).then(message => message.delete(5000));
                var auditLogEmbed = new Discord.RichEmbed()
                  .setColor(0xff793b)
                  .setTitle(`**Remove**`)
                  .setDescription(`**${message.author}** (${message.author.id})\nModified **${newNumber}** 
                    ${config.xpName} for ${userArray[i].toLowerCase()} (${userID})\n\n**Channel:**\n<#${message.channel.id}>`);
                  bot.channels.get(promoLogs.id).send(auditLogEmbed);
              }else{
                firebase.database().ref(`xpData/users/${userID}`).set({
                  xpValue: Number(currentXP) - Number(args[2])
                })
                if ((Number(currentXP) - Number(args[2])) < 0){
                  firebase.database().ref(`xpData/users/${userID}`).set({
                    xpValue: 0
                  })
                }




                var currentRankID = await rbx.getRankInGroup(config.groupID, userID)
                if (currentRankID === 0){
                  var errorEmbed = new Discord.RichEmbed()
                    .setColor(0xff4040)
                    .setDescription(`:warning: **${userArray[i]} isn't in the group!** :warning:`);
                    await message.channel.send(errorEmbed);
                }else{
                  var embed = new Discord.RichEmbed()
                    .setColor(0x5aa9fe)
                    .setTitle(`Insertion`)
                    .setDescription(`Inserted and updated **\`${userArray[i].toLowerCase()}\`**'s profile within my database!`)
                  await message.channel.send(embed).then(message => message.delete(5000));
                  var auditLogEmbed = new Discord.RichEmbed()
                    .setColor(0xff793b)
                    .setTitle(`**Remove**`)
                    .setDescription(`**${message.author}** (${message.author.id})\nModified **${newNumber}**
                     ${config.xpName} for ${userArray[i].toLowerCase()} (${userID})\n\n**Channel:**\n<#${message.channel.id}>`);
                    bot.channels.get(promoLogs.id).send(auditLogEmbed);


                  var { body } = await snekfetch.get(`${config.fireBaseURL}/roles/${currentRankID}.json`);
                  var requiredXPAtCurrentRankID = body.requiredXP

                  var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)

                  for (i = body.roles.length-1; i > 0; i--){
                    console.log(i)
                    var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)
                    var currentRankID = await rbx.getRankInGroup(config.groupID, userID)
                    var bodyRolesRankNum = body.roles[i].rank
                    var bodyRoleRankName = body.roles[i].name
                    var {body} = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`)
                    var currentXP = body.xpValue

                    var { body } = await snekfetch.get(`${config.fireBaseURL}/roles/${currentRankID}.json`);

                    var requiredXPAtCurrentRankID = body.requiredXP
                    console.log(`current ${config.xpName}- ${currentXP}\nrequired ${config.xpName}- ${requiredXPAtCurrentRankID}`)

                    if (Number(currentRankID) === Number(bodyRolesRankNum)){
                      if (currentXP < requiredXPAtCurrentRankID){
                        await rbx.demote(Number(userID))
                        console.log('demoted')
                        var rblxUsername = await rbx.getUsernameFromId(userID)
                        var embed = new Discord.RichEmbed()
                        .setColor(0xeb4034)
                        .setDescription(`Unfortunately, [${rblxUsername}](https://www.roblox.com/users/${userID}/profile) 
                          has been demoted because [${rblxUsername}](https://www.roblox.com/users/${userID}/profile)'s ${config.xpName} 
                          was less than the required amount of ${config.xpName} for the rank of **\`${bodyRoleRankName}\` (${requiredXPAtCurrentRankID})** `)
                        await message.channel.send(embed)
                      }
                    }
                  }

                  var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)

                  for (i = 1; i < body.roles.length-1; i++){
                    console.log(i)
                    var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)

                    if (body.roles[i].rank === Number(currentRankID)){
                      var bodyRolesRankNumber = body.roles[i+1].rank;

                      var {body} = await snekfetch.get(`${config.fireBaseURL}/xpData/users/${userID}.json`)
                      var currentXP = body.xpValue

                      var { body } = await snekfetch.get(`${config.fireBaseURL}/roles/${bodyRolesRankNumber}.json`);
                      if ((Number(body.requiredXP) !== Number(0)) && (currentXP >= body.requiredXP)){
                        console.log('promoted')
                        var rblxUsername = await rbx.getUsernameFromId(userID)
                        var embed = new Discord.RichEmbed()
                        .setColor(0x26ff93)
                        .setDescription(`[${rblxUsername}](https://www.roblox.com/users/${userID}/profile) has been promoted!`)
                        await message.channel.send(embed)
                        await rbx.promote(Number(userID));
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  if (message.content.toLowerCase().startsWith(`${config.prefix}setup`)){
    if (message.author.id !== message.guild.owner.id){
      return message.channel.send(`Sorry ${message.author}, but only the guild owner (${message.guild.owner}) can 
        run that command!`).then(message => message.delete(5000));
    }else if (config.groupID === 0){
      return message.channel.send(`Sorry ${message.author}, but I'm missing the group's ID--which can be entered in the
       config.json file.`).then(message => message.delete(5000));
    }
    var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}`)
    if (body.errors){
      return message.channel.send(`Sorry ${message.author}, but you provided me with an invalid group ID in 
        the config.json file.`).then(message => message.delete(5000));
    }
    await message.channel.send(`Pulling information from **${body.name}** (\`${body.id}\`)`).then(message => message.delete(2000));
    var {body} = await snekfetch.get(`https://groups.roblox.com/v1/groups/${config.groupID}/roles`)
    var roles = [];
    var xpData = [];
    for (i = 1; i < body.roles.length; i++){
      if (body.roles[1].rank === body.roles[i].rank){
        firebase.database().ref(`roles/${body.roles[i].rank}`).set({
          requiredXP: 0 // has to be zero to make sense
        })
      }else if (body.roles[body.roles.length-1].rank === body.roles[i].rank){
        firebase.database().ref(`roles/${body.roles[i].rank}`).set({
          requiredXP: 0 // has to be zero to make sense
        })
      }else{
        const location = await message.channel.send(`How many ${config.xpName} should be required to achieve the rank of **
          \`${body.roles[i].name}\`**?`).then(msg => msg.channel).catch(() => {
          return message.channel.send(`Sorry ${message.author}, but I couldn't direct message you.`).then(message => message.delete(6000));
        })
        const timeCollectionThing = { max: 1, time: 30000, errors: ['time'] };
        const collected = await location.awaitMessages(response => message.author === response.author, timeCollectionThing).catch(() => null);
        var responseArray1 = collected.map(m => m.content);
        if (isNaN(Number(responseArray1[0]))){
          return message.channel.send(`Sorry ${message.author}, but you didn't provide me with a real number.  I've cancelled the setup process.`)
        }else if (Number(responseArray1[0]) < 0){
          return message.channel.send(`Sorry ${message.author}, but you provided me with a negative number.  I've cancelled the setup process.`)
        }else if (Number(responseArray1[0]) <= Number(xpData[i]) && Number(responseArray1[0]) !== Number(0)){
          return message.channel.send(`Sorry ${message.author}, but you provided me with a number that was either less than or equal
           to the required ${config.xpName} for the previous rank--the logic **will not** work if continued.  I've cancelled the setup process.`)
        }else{
          firebase.database().ref(`roles/${body.roles[i].rank}`).set({
            requiredXP: Number(responseArray1[0])
          })
          xpData.push(Number(responseArray1[0]));
          await message.channel.send(`Awesome, I've set the required ${config.xpName} to achieve the rank of **\`${body.roles[i].name}\`** @ 
            **${responseArray1[0]}**!`)
        }
      }
    }
    console.log(xpData);
    const finallyDone = new Discord.RichEmbed()
      .setColor(0x4aff98)
      .setTitle(`**${config.xpName} Requirements**`)
    for (i = 1; i < body.roles.length; i++){
      if (body.roles[1].rank === body.roles[i].rank){
        finallyDone.addField(`:lock: **\`${body.roles[i].name} | ${body.roles[i].rank} | ${body.roles[i].id}\`**`, `0 ${config.xpName}`, true)
      }else if (body.roles[body.roles.length-1].rank === body.roles[i].rank){
          finallyDone.addField(`:lock: **\`${body.roles[i].name} | ${body.roles[i].rank} | ${body.roles[i].id}\`**`, `0 ${config.xpName}`, true)
      }else{
          finallyDone.addField(`**\`${body.roles[i].name} | ${body.roles[i].rank} | ${body.roles[i].id}\`**`, `${xpData[0]} ${config.xpName}`, true)
          xpData.shift()
      }
    }
    return message.reply(finallyDone);
  }

});


bot.login(config.bot_token)
