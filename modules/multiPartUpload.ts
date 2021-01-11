// import * as https from "https"
// import JSONbig from "json-bigint"
// import * as fs from "fs"
//
// const FILE = "yeet.txt"
// const req = https.request("https://content.dropboxapi.com/2/files/upload_session/start",
//     {
//         method: "POST",
//         headers: {
//             'Authorization': `Bearer`,
//             `Dropbox-API-Arg`
// :
// JSON.stringify({
//     "close": false
// }),
//     "Content-Type"
// :
// "application/octet-stream",
// }
// },
// (res) => {
//     res.on("data", (d) => {
//         const json = JSON.parse(d.toString("utf8"))
//         const session_id = json.session_id
//         let offset = BigInt(0)
//
//         const stream = fs.createReadStream(FILE)
//         stream.on("data", (chunk) => {
//             console.log(offset)
//             stream.pause()
//             const reqAppend = https.request("https://content.dropboxapi.com/2/files/upload_session/append_v2", {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${TOKEN}`,
//                     'Dropbox-API-Arg': JSONbig.stringify({
//                         'cursor': {
//                             'session_id': session_id,
//                             'offset': offset
//                         },
//                         'close': false
//                     }),
//                     'Content-Type': 'application/octet-stream',
//                 }
//             }, (res) => {
//                 stream.resume()
//             })
//
//             reqAppend.write(chunk)
//             reqAppend.end()
//
//             offset += BigInt(chunk.length)
//         })
//     })
// }
// )