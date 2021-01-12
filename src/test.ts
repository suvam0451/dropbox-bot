export function checkBuffer(buffer: Buffer, chunk: Buffer) {
    if (!buffer) {
        buffer = Buffer.from(chunk);
    } else {
        buffer = Buffer.concat([buffer, chunk]);
    }

    return buffer.length >= chunk.length;
};