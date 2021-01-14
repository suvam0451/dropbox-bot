const https = require("https");
const JSONbig = require('json-bigint');
import * as dotenv from "dotenv"
import * as path from 'path';
import * as fs from 'fs'

dotenv.config()

const req = https.request(`https://content.dropboxapi.com/2/files/upload_session/start`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
        'Dropbox-API-Arg': JSON.stringify({
            'close': false
        }),
        'Content-Type': 'application/octet-stream',
    }
}, (res: any) => {
    res.on('data', (d : any) => {
        const json = JSON.parse(d.toString('utf8'));
        const session_id = json.session_id
        let offset = BigInt(0);

        const stream = fs.createReadStream('test-large.txt');
        stream.on('data', (chunk) => {
            console.log(offset);
            stream.pause();
            const reqAppend = https.request(`https://content.dropboxapi.com/2/files/upload_session/append_v2`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Dropbox-API-Arg': JSONbig.stringify({
                        'cursor': {
                            'session_id': session_id,
                            'offset': offset
                        },
                        'close': false
                    }),
                    'Content-Type': 'application/octet-stream',
                }
            }, (res) => {
                stream.resume();
            });

            reqAppend.write(chunk);
            reqAppend.end();

            offset += BigInt(chunk.length);
        });

        stream.on('end', () => {
            const reqFinish = https.request(`https://content.dropboxapi.com/2/files/upload_session/finish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Dropbox-API-Arg': JSON.stringify({
                        'cursor': {
                            'session_id': session_id,
                            'offset': offset
                        },
                        "commit": {
                            "path": "/Upload/test-large.txt",
                            "mode": "add",
                            "autorename": true,
                            "mute": false,
                            "strict_conflict": false
                        }
                    }),
                    'Content-Type': 'application/octet-stream',
                }
            }, (res) => {
                console.log('upload session finish')
                console.log("statusCode: ", res.statusCode);
            });

            reqFinish.end();
        });
    });
});


req.end();