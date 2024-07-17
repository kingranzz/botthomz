require("./settings.js")
const useCODE = process.argv.includes("--code")
const useQR = !useCODE
const { default: makeWASocket, makeWALegacySocket, BufferJSON, Browsers, initInMemoryStore, extractMessageContent, makeInMemoryStore, proto, delay, DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, jidDecode, areJidsSameUser, PHONENUMBER_MCC, WA_DEFAULT_EPHEMERAL, relayMessage, getContentType, generateWAMessage, generateWAMessageContent, generateForwardMessageContent, generateWAMessageFromContent, downloadContentFromMessage } = require ("@whiskeysockets/baileys")
const { parsePhoneNumber } = require("libphonenumber-js")
const store = makeInMemoryStore({ "logger": pino({ "level": "silent" }).child({ "level": "silent" })})

store.readFromFile(path.join(__dirname, "./store.json"))
setInterval(() => {
store.writeToFile(path.join(__dirname, "./store.json"))
}, 3000)

async function startSesi() {
    const { state, saveCreds } = await useMultiFileAuthState("./session")
    const { version, isLatest } = await fetchLatestBaileysVersion()
    const nodeCache = new NodeCache()
    const connectionUpdate = {
      version,
      keepAliveInternalMs: 30000,
      printQRInTerminal: useQR && !useCODE,
      generateHighQualityLinkPreview: true,
      msgRetryCounterCache: nodeCache,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: undefined,
      logger: pino({ level: "fatal" }),
      auth: state,
      browser: ["Chrome (Linux)", "", ""]
    }
    const x = require("./thomz").makeWASocket(connectionUpdate)
    
    store.bind(x.ev)
    
    if (useCODE && !x.user && !x.authState.creds.registered) {
      async function StartYtta() {
        const rl = readline.createInterface({
          "input": process.stdin,
          "output": process.stdout
        })
        const meong = quest1 => new Promise(quest2 => rl.question(quest1, quest2))
        const numbSetan = await meong("\nPlease type your WhatsApp number : ")
        numbSetanb = numbSetan.replace(/[^0-9]/g, '')
        numSetan = parsePhoneNumber("+" + numbSetanb)
        if (!numSetan.isValid()) {
          console.log(chalk.bgBlack(chalk.redBright("Masukan Nomor WhatsApp kalian dengan awalan 62 , Contoh : 6282375197753")))
          rl.close()
          return StartYtta()
        }
        const phoneNumber = PHONENUMBER_MCC[numSetan.countryCallingCode]
        if (!phoneNumber) {
          console.log(chalk.bgBlack(chalk.redBright("Masukan Nomor WhatsApp kalian dengan awalan 62 , Contoh : 6282375197753")))
          rl.close()
          return StartYtta()
        }
        const codePairing = await x.requestPairingCode(numbSetanb)
        code = codePairing?.match(/.{1,4}/g)?.join("-") || codePairing
        console.log(chalk.bgBlack(chalk.bgGreen("Your pairing code : ")), chalk.black(chalk.bgWhite(code)))
        rl.close()
      }
      await StartYtta()
    }
    
    x.ev.on("connection.update", ({ connection }) => {
      if (connection === "open") {
        console.log("KONEKSI BANG DEFZ " + "Terhubung (" + x.user?.["id"]["split"](":")[0] + ")")
      }
      if (connection === "close") {
        startSesi()
      }
      if (connection === "connecting") {
        if (x.user) {
          console.log("SC PAIRING BY DEFZ\nYT : @defzzzz\nCREATOR : Defz\nSELAMAT MENIKMATI")
        } else if (!useQR && !useCODE) {
          console.log("CONNECTION BANG DEFZ " + "Autentikasi Dibutuhkan\nGunakan Perintah \x1B[36mnpm start\x1B[0m untuk terhubung menggunakan nomor telepon\n\n\x1B[1m\x1B[41m Full Tutorial Check di Youtube: @defzzzz \x1B[0m\n\n")
        }
      }
    })
    
    x.ev.process(async (events) => {
      if (events['messages.upsert']) {
        const upsert = events['messages.upsert']
        for (let msg of upsert.messages) {
          if (!msg.message) {
            return
          }
          if (msg.key.remoteJid === 'status@broadcast') {
            if (msg.message?.protocolMessage) return
            console.log(`Lihat Status ${msg.pushName} ${msg.key.participant.split('@')[0]}`)
            await x.readMessages([msg.key])
            await delay(1000)
            return await x.readMessages([msg.key])
          }
          const nx = smsg(x, msg)
          require("./casethomz")(x, nx, store)
        }
      }
    })
    
    x.ev.on('group-participants.update', async (anu) => {
      try {
        var isWelcome = welcome.includes(anu.id)
      } catch {
        var isWelcome = false
      }
      if (isWelcome) {
        console.log(anu)
        const metadata = await x.groupMetadata(anu.id)
        const participants = anu.participants
        for (let num of participants) {
          try {
            ppuser = await x.profilePictureUrl(num, 'image')
          } catch {
            ppuser = 'https://telegra.ph/file/e323980848471ce8e2150.png'
          }
          if (anu.action == 'add') {
            const txtwel = `Welcome Sis @${num.split("@")[0]}, I hope you feel at home and always healthy`
            await x.sendMessage(anu.id, { image: { url: ppuser }, caption: txtwel, contextInfo: { forwardingScore: 9999999,  isForwarded: true, mentionedJid: [num] }})
          } else if (anu.action == 'remove') {
            const txtlea = `Goodbye sis @${num.split("@")[0]}, don't forget your friends here, I hope you are always healthy`
            await x.sendMessage(anu.id, { image: { url: ppuser }, caption: txtlea, contextInfo: { forwardingScore: 9999999,  isForwarded: true, mentionedJid: [num] }})
          }
        }
      }
    })

    x.ev.on('creds.update', saveCreds)
    
    return x
}

startSesi()