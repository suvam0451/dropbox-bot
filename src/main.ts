import {Dropbox, Error, files} from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from "dotenv"

dotenv.config()

const dbx = new Dropbox({accessToken: process.env.DROPBOX_ACCESS_TOKEN});

console.log(process.argv[2])

fs.readFile(path.join(__dirname, process.argv[2]), (err, contents) => {
    if (err) {
        console.log('Error: ', err);
    }

    // This uploads basic.js to the root of your dropbox
    dbx.filesUpload({path: "/" + process.argv[2], contents})
        .then((response: any) => {
            console.log(response);
        })
        .catch((uploadErr: Error<files.UploadError>) => {
            console.log(uploadErr);
        });
});