/**
 * To run example you have to create 'credentials.json' file
 * in current location.
 *
 * File should contain JSON object, with 'TOKEN' property.
 */

import {Dropbox, Error, files} from 'dropbox';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from "dotenv"
import UploadSessionStartArg = files.UploadSessionStartArg;
import UploadSessionAppendArg = files.UploadSessionAppendArg;
import UploadSessionCursor = files.UploadSessionCursor;
import UploadSessionFinishArg = files.UploadSessionFinishArg;

dotenv.config()

const dbx = new Dropbox({accessToken: process.env.DROPBOX_ACCESS_TOKEN});
const FILE_PATH = process.argv[2]
const FILE_NAME = path.basename(FILE_PATH)

function logProgress(progress: number, total: number) {
    console.log("Completed chunk upload: " + (progress + 1).toString() + "/" + total)
}

function logOffsets(offsetFrom: number, offsetTo: number, totalOffset: number) {
    console.log(`Buffered: ${offsetFrom}/${totalOffset} to ${offsetTo}/${totalOffset}`)
}

console.log("Uploading " + FILE_NAME)
fs.readFile(FILE_PATH, 'utf8', (err, contents) => {
    // contents.length
    const content = Buffer.from(contents, "utf8")
    const maxBlob = 8 * 1000 * 1000; // 8Mb - Dropbox JavaScript API suggested max file / chunk size
    let workItems: Buffer[] = []
    let offset = 0
    const FILE_SIZE = content.length
    while (offset < FILE_SIZE) {
        const chunkSize = Math.min(maxBlob, content.length - offset)
        workItems.push(content.slice(offset, offset + chunkSize))
        offset += chunkSize
    }
    const NUM_CHUNKS = workItems.length

    const task = workItems.reduce((acc, blob, idx, items) => {
        if (idx == 0) {
            // First chunk initializes the upload session
            return acc.then(() => {
                // @ts-ignore
                let args: UploadSessionStartArg = {
                    close: false,
                    contents: blob
                }
                return dbx.filesUploadSessionStart(args).then(response => {
                    logProgress(idx, NUM_CHUNKS)
                    logOffsets(0, blob.length, FILE_SIZE)
                    return response.result.session_id
                })
            })
        } else if (idx < items.length - 1) {
            // Intermediate chunks continue to stream to the session
            return acc.then((sessionId) => {
                // @ts-ignore (bug with the "contents parameter")
                let cursor: UploadSessionCursor = {session_id: sessionId, offset: idx * maxBlob}
                let args: UploadSessionAppendArg = {
                    cursor: cursor,
                    close: false,
                    contents: blob
                }
                return dbx.filesUploadSessionAppendV2(args).then(() => {
                    logProgress(idx, NUM_CHUNKS)
                    logOffsets(maxBlob * idx, maxBlob * (idx + 1), FILE_SIZE)
                    return sessionId
                })
            })
        } else {
            // The final chunk terminates the session and signals finalization to the server
            return acc.then((sessionId) => {
                // @ts-ignore (bug with the "contents parameter")
                let cursor: UploadSessionCursor = {session_id: sessionId, offset: FILE_SIZE - blob.length}
                const commit: files.CommitInfo = {
                    path: "/" + FILE_NAME,
                    // @ts-ignore
                    mode: "add",
                    autorename: true,
                    mute: false
                }
                const args: UploadSessionFinishArg = {
                    cursor: cursor,
                    commit: commit,
                    contents: blob
                }
                logProgress(idx, NUM_CHUNKS)
                logOffsets(FILE_SIZE - blob.length, FILE_SIZE, FILE_SIZE)
                return dbx.filesUploadSessionFinish({cursor: cursor, commit: commit, contents: blob})
            })
        }
    }, Promise.resolve(""))

    task.then((result) => {
        if (typeof (result) == "string") {
            console.log("Failed: " + result)
        } else {
            console.log(`Status ${result.status} : ${result.result.path_lower}`)
        }
    })
})

