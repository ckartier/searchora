/**
 * Minimal, dependency-free ZIP writer (store mode — no compression).
 *
 * The GEO pack is a handful of small text files, so the deflate-free "stored"
 * method keeps the archive valid everywhere while adding zero dependencies.
 * Produces a standard PKZIP container: local headers + central directory + EOCD.
 */

const CRC_TABLE = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
        let c = n;
        for (let k = 0; k < 8; k += 1) {
            c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        }
        table[n] = c >>> 0;
    }
    return table;
})();

function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i += 1) {
        crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
}

// DOS date/time for a fixed, reproducible timestamp (2026-01-01 00:00).
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;

/**
 * @param {Array<{name:string, content:string}>} files
 * @returns {Buffer} the ZIP archive
 */
export function createZip(files) {
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    for (const file of files) {
        const nameBuf = Buffer.from(file.name, 'utf8');
        const dataBuf = Buffer.from(file.content, 'utf8');
        const crc = crc32(dataBuf);

        const localHeader = Buffer.alloc(30);
        localHeader.writeUInt32LE(0x04034b50, 0); // local file header signature
        localHeader.writeUInt16LE(20, 4); // version needed
        localHeader.writeUInt16LE(0x0800, 6); // flags: UTF-8 names
        localHeader.writeUInt16LE(0, 8); // method: store
        localHeader.writeUInt16LE(DOS_TIME, 10);
        localHeader.writeUInt16LE(DOS_DATE, 12);
        localHeader.writeUInt32LE(crc, 14);
        localHeader.writeUInt32LE(dataBuf.length, 18); // compressed size
        localHeader.writeUInt32LE(dataBuf.length, 22); // uncompressed size
        localHeader.writeUInt16LE(nameBuf.length, 26);
        localHeader.writeUInt16LE(0, 28); // extra length

        localParts.push(localHeader, nameBuf, dataBuf);

        const centralHeader = Buffer.alloc(46);
        centralHeader.writeUInt32LE(0x02014b50, 0); // central dir header signature
        centralHeader.writeUInt16LE(20, 4); // version made by
        centralHeader.writeUInt16LE(20, 6); // version needed
        centralHeader.writeUInt16LE(0x0800, 8); // flags: UTF-8
        centralHeader.writeUInt16LE(0, 10); // method: store
        centralHeader.writeUInt16LE(DOS_TIME, 12);
        centralHeader.writeUInt16LE(DOS_DATE, 14);
        centralHeader.writeUInt32LE(crc, 16);
        centralHeader.writeUInt32LE(dataBuf.length, 20);
        centralHeader.writeUInt32LE(dataBuf.length, 24);
        centralHeader.writeUInt16LE(nameBuf.length, 28);
        centralHeader.writeUInt16LE(0, 30); // extra length
        centralHeader.writeUInt16LE(0, 32); // comment length
        centralHeader.writeUInt16LE(0, 34); // disk number
        centralHeader.writeUInt16LE(0, 36); // internal attrs
        centralHeader.writeUInt32LE(0, 38); // external attrs
        centralHeader.writeUInt32LE(offset, 42); // offset of local header

        centralParts.push(centralHeader, nameBuf);

        offset += localHeader.length + nameBuf.length + dataBuf.length;
    }

    const centralDir = Buffer.concat(centralParts);
    const localData = Buffer.concat(localParts);

    const eocd = Buffer.alloc(22);
    eocd.writeUInt32LE(0x06054b50, 0); // end of central dir signature
    eocd.writeUInt16LE(0, 4); // disk number
    eocd.writeUInt16LE(0, 6); // disk with central dir
    eocd.writeUInt16LE(files.length, 8); // entries on this disk
    eocd.writeUInt16LE(files.length, 10); // total entries
    eocd.writeUInt32LE(centralDir.length, 12); // central dir size
    eocd.writeUInt32LE(localData.length, 16); // central dir offset
    eocd.writeUInt16LE(0, 20); // comment length

    return Buffer.concat([localData, centralDir, eocd]);
}
