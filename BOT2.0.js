const Discord = require('discord.js');
const client = new Discord.Client();
const prefix = "re!"

let cash = require("./cash.json")
let xp = require("./xp.json")
const fs = require("fs")
let msgg = require("./messages.json")
let fbstats = require("./fbstats.json")
const moment = require('moment')
const gb = require("./guildBudget.json")
let cooldown = new Set()

const bot = new Discord.Client({disableEveryone: true})


client.on('ready', () => { 
 
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity(`We don't die we multiply`, {type: 1})
    client.user.setStatus("dnd")


});

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()

fs.readdir("./commands/", (err, files) => {

    if(err) console.log(err)

    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if(jsfile.length <= 0) {
        return console.log("No Commands")
    }

    jsfile.forEach((f, i) => {
        let pull = require(`./commands/${f}`);
        console.log(`${f} loaded`)
        client.commands.set(pull.config.name, pull)
        pull.config.aliases.forEach(alias => {
            client.aliases.set(alias, pull.config.name)
        })
    })
})
client.on('message', async message => {

    if(message.author.bot) return;

    

    if(!fbstats[message.author.id]){
        fbstats[message.author.id] = {
            PassingYards: 0,
            PassAttempts: 0,
            PassCompletions: 0,
            PassDeflections: 0,
            Interceptions: 0,
            ReceivingYards: 0,
            Catches: 0,
            InterceptionsThrown: 0,
            CBTargets: 0,
            WRTargets: 0,
            CatchesAllowed: 0,
            YardsAllowed: 0,
            IntsAllowed: 0
        }
    }

    fs.writeFile("./fbstats.json", JSON.stringify(fbstats, null, 2), (err) => {
        if (err) console.log(err)
    })

    if(!cash[message.author.id]) {
        cash[message.author.id] = {
            Cash: 1500,
            LastDaily: 'Not Collected'
        }
    }
    cash[message.author.id].Cash = cash[message.author.id].Cash + 1
    

    fs.writeFile("./cash.json", JSON.stringify(cash, null, 2), (err) => {
        if (err) console.log(err)
    })


    let xpAdd = Math.floor(Math.random() * 10) + 1
    
    if(!gb[message.guild.id]) {
        gb[message.guild.id] = {
            Budget: 0,
            Level: 1,
            XP: 0,
            Diamonds: 0
        }
    }
    
    let curxp = gb[message.guild.id].XP
    let curlvl = gb[message.guild.id].Level
    let nextlvl = gb[message.guild.id].Level * 10000
    gb[message.guild.id].XP = curxp + xpAdd
    let diamonds = gb[message.guild.id].Diamonds


    if(nextlvl <= curxp) {

        gb[message.guild.id].Level = curlvl + 1
        gb[message.guild.id].Diamonds = gb[message.guild.id].Diamonds + 10
        let lvlup = new Discord.RichEmbed()
            .setAuthor(message.guild.name, message.guild.iconURL)
            .setTitle(`${message.guild.name} has leveled up to ${curlvl + 1}🔺`)
            .addField("+10 Diamonds💎", `${diamonds + 10} Diamonds total`)
            .setThumbnail(message.guild.iconURL)

        message.channel.send(lvlup)
        
    }

    fs.writeFile("./guildBudget.json", JSON.stringify(gb, null, 2), (err) => {
        if (err) console.log(err)
    })



    let messageArray = message.content.split(" ")
    const args = messageArray.slice(1)
    const command = messageArray[0].toLowerCase()
    
    if(!command.startsWith(prefix)) return
    if(cooldown.has(message.author.id)) {
        message.delete()
       return message.channel.send("Wait 5 seconds between commands")
    }
    if(message.author.id != 223940908121325568) {
        cooldown.add(message.author.id)
    }

    let commandfile = client.commands.get(command.slice(prefix.length)) || client.commands.get(client.aliases.get(command.slice(prefix.length)))
    if(commandfile) commandfile.run(client, message, args)

    setTimeout(() => {
        cooldown.delete(message.author.id)
    }, 5000)
})


client.login(process.env.BOT_TOKEN);
