import {Dropbox, Error, files} from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from "dotenv"

dotenv.config()

const dbx = new Dropbox({accessToken: process.env.DROPBOX_ACCESS_TOKEN});

fs.readFile(process.argv[2], 'utf8', (err, contents) => {
    if (err) {
        console.log('Error: ', err);
    }

    // This uploads basic.js to the root of your dropbox
    dbx.filesUpload({path: "/" + path.basename(process.argv[2]), contents})
        .then((response: any) => {
            console.log("Upload succeeded")
            console.log(response);
        })
        .catch((uploadErr: Error<files.UploadError>) => {
            console.log("Error occured during upload")
            console.log(uploadErr);
        });
});