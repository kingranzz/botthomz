/* SETTING NOMOR OWNER */
global.namaBot = "BOTZ" // Change Your Bot Name
global.namaOwner = "ranz" // Change your Owner Name
global.nomorOwner = "6282393734303" // Change To Your Owner Number
global.save = "BUYER" //change to your save name
/* SETTING MODULE */
global.util = require("util")
global.CFonts = require("cfonts")
global.readline = require("readline")
global.pino = require("pino")
global.chalk = require("chalk")
global.NodeCache = require("node-cache")
global.fs = require("fs")
global.syntaxerror = require("syntax-error")
global.moment = require("moment-timezone")
global.FileType = require("file-type")
global.ffmpeg = require("fluent-ffmpeg")
global.crpto = require("crypto")
global.os = require("os")
global.fetch = require("node-fetch")
global.path = require("path")
global.webp = require("node-webpmux")
global.axios = require("axios")
global.proto = require("@whiskeysockets/baileys").proto
global.getContentType = require("@whiskeysockets/baileys").getContentType
global.downloadMediaMessage = require("@whiskeysockets/baileys").downloadMediaMessage
global.exec = require("child_process").exec
global.FormData = require("form-data")
global.speed = require("performance-now")
global.path = require("path")
global.sizeFormatter = require("human-readable").sizeFormatter
global.Boom = require("@hapi/boom").Boom
global.rimraf = require("rimraf")
global.vm = require("node:vm")
global.JSDOM = require("jsdom").JSDOM
global.cheerio = require("cheerio")
global.Tiktok = require("@xct007/tiktok-scraper").Tiktok

/* DATABASE */
global.listdb = JSON.parse(fs.readFileSync('./database/list.json').toString()) // Do Not Replace Entar Error
global.antilink = JSON.parse(fs.readFileSync('./database/antilink.json').toString()) // Do Not Replace Entar Error
global.welcome = JSON.parse(fs.readFileSync('./database/welcome.json').toString()) // Do Not Replace Entar Error
global.prem = JSON.parse(fs.readFileSync('./database/premium.json').toString()) // Do Not Replace Entar Error

/* 
FUNCTION MSG HARAP JANGAN DI UBAH 
JIKA TIDAK MAU ERROR 
*/
global.smsg = (x, msg) => {
let M = proto.WebMessageInfo
msg = M.fromObject(msg)
if (msg.key) {
msg.id = msg.key.id
msg.isBaileys = msg.id && msg.id.length === 16 || msg.id.startsWith('3EB0') && msg.id.length === 12 || false
msg.chat = x.decodeJid(msg.key.remoteJid || message.message?.senderKeyDistributionMessage?.groupId || '')
msg.now = msg.messageTimestamp
msg.isGroup = msg.chat.endsWith('@g.us')
msg.sender = x.decodeJid(msg.key.fromMe && x.user.id || msg.participant || msg.key.participant || msg.chat || '')
}
if (msg.message) {
let mtype = Object.keys(msg.message)
msg.mtype = (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(mtype[0]) && mtype[0]) || 
(mtype.length >= 3 && mtype[1] !== 'messageContextInfo' && mtype[1]) || 
mtype[mtype.length - 1]
msg.type = getContentType(msg.message)
msg.msg = (msg.mtype == 'viewOnceMessage' ? msg.message[msg.mtype].message[getContentType(msg.message[msg.mtype].message)] : msg.message[msg.type])
if (msg.chat == 'status@broadcast' && ['protocolMessage', 'senderKeyDistributionMessage'].includes(msg.mtype)) msg.chat = (msg.key.remoteJid !== 'status@broadcast' && msg.key.remoteJid) || msg.sender
if (msg.mtype == 'protocolMessage' && msg.msg.key) {
if (msg.msg.key.remoteJid == 'status@broadcast') msg.msg.key.remoteJid = msg.chat
if (!msg.msg.key.participant || msg.msg.key.participant == 'status_me') msg.msg.key.participant = msg.sender
msg.msg.key.fromMe = x.decodeJid(msg.msg.key.participant) === x.decodeJid(x.user.id)
if (!msg.msg.key.fromMe && msg.msg.key.remoteJid === x.decodeJid(x.user.id)) msg.msg.key.remoteJid = msg.sender
}
msg.text = msg.msg || ''
msg.mentionedJid = msg.msg?.contextInfo?.mentionedJid?.length && msg.msg.contextInfo.mentionedJid || []
let quoted = msg.quoted = msg.msg?.contextInfo?.quotedMessage ? msg.msg.contextInfo.quotedMessage : null
if (msg.quoted) {
let type = Object.keys(msg.quoted)[0]
msg.quoted = msg.quoted[type]
if (typeof msg.quoted === 'string') msg.quoted = { text: msg.quoted }
msg.quoted.mtype = type
msg.quoted.id = msg.msg.contextInfo.stanzaId
msg.quoted.chat = x.decodeJid(msg.msg.contextInfo.remoteJid || msg.chat || msg.sender)
msg.quoted.isBaileys = msg.quoted.id && msg.quoted.id.length === 16 || false
msg.quoted.sender = x.decodeJid(msg.msg.contextInfo.participant)
msg.quoted.text = msg.quoted.text || msg.quoted.caption || msg.quoted.contentText || ''
msg.quoted.mentionedJid = msg.quoted.contextInfo?.mentionedJid?.length && msg.quoted.contextInfo.mentionedJid || []
let vM = msg.quoted.fakeObj = M.fromObject({
key: {
fromMe: msg.quoted.fromMe,
remoteJid: msg.quoted.chat,
id: msg.quoted.id
},
message: quoted,
...(msg.isGroup ? { participant: msg.quoted.sender } : {})
})
msg.getQuotedObj = msg.getQuotedMessage = async () => {
if (!msg.quoted.id) return null
let q = M.fromObject(vM)
return smsg(x, q)
}
if (msg.quoted.url || msg.quoted.directPath) msg.quoted.download = () => x.downloadMediaMessage(msg.quoted)
msg.quoted.copy = () => smsg(x, M.fromObject(M.toObject(vM)))
}
}
if (msg.msg && msg.msg.url) msg.download = (saveToFile = false) => x.downloadM(msg.msg, msg.mtype.replace(/message/i, ''), saveToFile)
return msg
}
async function imageToWebp (media) {
const tmpFileOut = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
const tmpFileIn = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.jpg`)
fs.writeFileSync(tmpFileIn, media)
await new Promise((resolve, reject) => {
ffmpeg(tmpFileIn)
.on("error", reject)
.on("end", () => resolve(true))
.addOutputOptions([
"-vcodec",
"libwebp",
"-vf",
"scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
])
.toFormat("webp")
.save(tmpFileOut)
})
const buff = fs.readFileSync(tmpFileOut)
fs.unlinkSync(tmpFileOut)
fs.unlinkSync(tmpFileIn)
return buff
}
async function videoToWebp (media) {
const tmpFileOut = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
const tmpFileIn = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.mp4`)
fs.writeFileSync(tmpFileIn, media)
await new Promise((resolve, reject) => {
ffmpeg(tmpFileIn)
.on("error", reject)
.on("end", () => resolve(true))
.addOutputOptions([
"-vcodec",
"libwebp",
"-vf",
"scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
"-loop",
"0",
"-ss",
"00:00:00",
"-t",
"00:00:05",
"-preset",
"default",
"-an",
"-vsync",
"0"
])
.toFormat("webp")
.save(tmpFileOut)
})
const buff = fs.readFileSync(tmpFileOut)
fs.unlinkSync(tmpFileOut)
fs.unlinkSync(tmpFileIn)
return buff
}
async function writeExifImg (media, metadata) {
let wMedia = await imageToWebp(media)
const tmpFileIn = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
const tmpFileOut = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
fs.writeFileSync(tmpFileIn, wMedia)
if (metadata.packname || metadata.author) {
const img = new webp.Image()
const json = { "sticker-pack-id": `https://github.com/KirBotz`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
const exif = Buffer.concat([exifAttr, jsonBuff])
exif.writeUIntLE(jsonBuff.length, 14, 4)
await img.load(tmpFileIn)
fs.unlinkSync(tmpFileIn)
img.exif = exif
await img.save(tmpFileOut)
return tmpFileOut
}
}
async function writeExifVid (media, metadata) {
let wMedia = await videoToWebp(media)
const tmpFileIn = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
const tmpFileOut = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
fs.writeFileSync(tmpFileIn, wMedia)
if (metadata.packname || metadata.author) {
const img = new webp.Image()
const json = { "sticker-pack-id": `https://github.com/KirBotz`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
const exif = Buffer.concat([exifAttr, jsonBuff])
exif.writeUIntLE(jsonBuff.length, 14, 4)
await img.load(tmpFileIn)
fs.unlinkSync(tmpFileIn)
img.exif = exif
await img.save(tmpFileOut)
return tmpFileOut
}
}
async function writeExif (media, metadata) {
let wMedia = /webp/.test(media.mimetype) ? media.data : /image/.test(media.mimetype) ? await imageToWebp(media.data) : /video/.test(media.mimetype) ? await videoToWebp(media.data) : ""
const tmpFileIn = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
const tmpFileOut = path.join(os.tmpdir(), `${crpto.randomBytes(6).readUIntLE(0, 6).toString(36)}.webp`)
fs.writeFileSync(tmpFileIn, wMedia)
if (metadata.packname || metadata.author) {
const img = new webp.Image()
const json = { "sticker-pack-id": `https://github.com/KirBotz`, "sticker-pack-name": metadata.packname, "sticker-pack-publisher": metadata.author, "emojis": metadata.categories ? metadata.categories : [""] }
const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
const exif = Buffer.concat([exifAttr, jsonBuff])
exif.writeUIntLE(jsonBuff.length, 14, 4)
await img.load(tmpFileIn)
fs.unlinkSync(tmpFileIn)
img.exif = exif
await img.save(tmpFileOut)
return tmpFileOut
}
}
global.fetchJson = async (url, options) => {
try {
options ? options : {}
const res = await axios({
method: 'GET',
url: url,
headers: {
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36'
},
...options
})
return res.data
} catch (err) {
return err
}
}
async function uptotelegra (Path) {
return new Promise (async (resolve, reject) => {
if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
try {
const form = new FormData()
form.append("file", fs.createReadStream(Path))
const data = await  axios({
url: "https://telegra.ph/upload",
method: "POST",
headers: {
...form.getHeaders()
},
data: form
})
return resolve("https://telegra.ph" + data.data[0].src)
} catch (err) {
return reject(new Error(String(err)))
}
})
}
const formatp = sizeFormatter({
    std: 'JEDEC', 
    decimalPlaces: 2,
    keepTrailingZeroes: false,
    render: (literal, symbol) => `${literal} ${symbol}B`,
})
global.addResponList = (groupID, key, response, isImage, image_url, _db) => {
  var obj_add = {
    id: groupID,
    key: key,
    response: response,
    isImage: isImage,
    image_url: image_url
  }
  _db.push(obj_add)
  fs.writeFileSync('./database/list.json', JSON.stringify(_db, null, 3))
}
global.getDataResponList = (groupID, key, _db) => {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      position = x
    }
  })
  if (position !== null) {
    return _db[position]
  }
}
global.isAlreadyResponList = (groupID, key, _db) => {
  let found = false
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      found = true
    }
  })
  return found
}
global.sendResponList = (groupId, key, _dir) => {
  let position = null
  Object.keys(_dir).forEach((x) => {
    if (_dir[x].id === groupId && _dir[x].key === key) {
      position = x
    }
  })
  if (position !== null) {
    return _dir[position].response
  }
}
global.isAlreadyResponListGroup = (groupID, _db) => {
  let found = false
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID) {
      found = true
    }
  })
  return found
}
global.delResponList = (groupID, key, _db) => {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      position = x
    }
  })
  if (position !== null) {
    _db.splice(position, 1)
    fs.writeFileSync('./database/list.json', JSON.stringify(_db, null, 3))
  }
}
global.updateResponList = (groupID, key, response, isImage, image_url, _db) => {
  let position = null
  Object.keys(_db).forEach((x) => {
    if (_db[x].id === groupID && _db[x].key === key) {
      position = x
    }
  })
  if (position !== null) {
    _db[position].response = response
    _db[position].isImage = isImage
    _db[position].image_url = image_url
    fs.writeFileSync('./database/list.json', JSON.stringify(_db, null, 3))
  }
}
global.runtime = function(seconds) {
	seconds = Number(seconds);
	var d = Math.floor(seconds / (3600 * 24));
	var h = Math.floor(seconds % (3600 * 24) / 3600);
	var m = Math.floor(seconds % 3600 / 60);
	var s = Math.floor(seconds % 60);
	var dDisplay = d > 0 ? d + (d == 1 ? " Hari, " : " Hari, ") : "";
	var hDisplay = h > 0 ? h + (h == 1 ? " Jam, " : " Jam, ") : "";
	var mDisplay = m > 0 ? m + (m == 1 ? " Menit, " : " Menit, ") : "";
	var sDisplay = s > 0 ? s + (s == 1 ? " Detik" : " Detik") : "";
	return dDisplay + hDisplay + mDisplay + sDisplay;
}
global.tanggal = (numer) => {
	myMonths = ["𝖩𝖺𝗇𝗎𝖺𝗋𝗂","𝖥𝖾𝖻𝗋𝗎𝖺𝗋𝗂","𝖬𝖺𝗋𝖾𝗍","𝖠𝗉𝗋𝗂𝗅","𝖬𝖾𝗂","𝖩𝗎𝗇𝗂","𝖩𝗎𝗅𝗂","𝖠𝗀𝗎𝗌𝗍𝗎𝗌","𝖲𝖾𝗉𝗍𝖾𝗆𝖻𝖾𝗋","𝖮𝗄𝗍𝗈𝖻𝖾𝗋","𝖭𝗈𝗏𝖾𝗆𝖻𝖾𝗋","𝖣𝖾𝗌𝖾𝗆𝖻𝖾𝗋"];
	myDays = ['𝖬𝗂𝗇𝗀𝗀𝗎','𝖲𝖾𝗇𝗂𝗇','𝖲𝖾𝗅𝖺𝗌𝖺','𝖱𝖺𝖻𝗎','𝖪𝖺𝗆𝗂𝗌','𝖩𝗎𝗆𝖺𝗍','𝖲𝖺𝖻𝗍𝗎']; 
	var tgl = new Date(numer);
	var day = tgl.getDate()
	bulan = tgl.getMonth()
	var thisDay = tgl.getDay(),
	thisDay = myDays[thisDay];
	var yy = tgl.getYear()
	var year = (yy < 1000) ? yy + 1900 : yy; 
	const time = moment.tz('Asia/Jakarta').format('DD/MM HH:mm:ss')
	let d = new Date
	let locale = 'id'
	let gmt = new Date(0).getTime() - new Date('1 January 1970').getTime()
	let weton = ['Pahing', 'Pon','Wage','Kliwon','Legi'][Math.floor(((d * 1) + gmt) / 84600000) % 5]
	return`${day} ${myMonths[bulan]} ${thisDay} ${year}`
}
async function remini(img1, img2) {
  return new Promise(async (img3, img4) => {
    let img5 = ['enhance', "recolor", "dehaze"]
    if (img5.includes(img2)) {
      img2 = img2
    } else {
      img2 = img5[0]
    }
    let fromdata = new FormData()
    let UrlWeb = "https://inferenceengine.vyro.ai/" + img2
    fromdata.append("model_version", 1, {
      'Content-Transfer-Encoding': "binary",
      'contentType': "multipart/form-data; charset=uttf-8"
    })
    fromdata.append('image', Buffer.from(img1), {
      'filename': "enhance_image_body.jpg",
      'contentType': "image/jpeg"
    })
    fromdata.submit({
      'url': UrlWeb,
      'host': "inferenceengine.vyro.ai",
      'path': '/' + img2,
      'protocol': "https:",
      'headers': {
        'User-Agent': 'okhttp/4.9.3',
        'Connection': "Keep-Alive",
        'Accept-Encoding': "gzip"
      }
    }, function (img6, img7) {
      if (img6) {
        img4()
      }
      let img8 = []
      img7.on('data', function (img9, img10) {
        img8.push(img9)
      }).on("end", () => {
        img3(Buffer.concat(img8))
      })
      img7.on("error", img11 => {
        img4()
      })
    })
  })
}
global.imageToWebp = imageToWebp
global.videoToWebp = videoToWebp
global.writeExifImg = writeExifImg
global.writeExifVid = writeExifVid
global.writeExif = writeExif
global.uptotelegra = uptotelegra
global.formatp = formatp
global.remini = remini
require("./youtube")

// THUMB MENU
global.thumb = fs.readFileSync("./database/image/thumb.png")

const file = require.resolve(__filename)
fs.watchFile(file, () => {
  fs.unwatchFile(file)
  console.log(chalk.redBright(`Update File ${__filename}`))
  delete require.cache[file]
  require(file)
})