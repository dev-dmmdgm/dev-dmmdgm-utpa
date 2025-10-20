// Imports
import BunSqlite from "bun:sqlite";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Creates database
export const database = new BunSqlite("database.sqlite", {
    create: true,
    strict: true
});

// Creates excepts
export enum Except {
    USER_ENTRY_HIT = 8000,
    USER_ENTRY_MISS,
    USER_NAME_INVALID,
    USER_PASS_FAILED,
    USER_PASS_INVALID,
    TOKEN_ENTRY_HIT = 8100,
    TOKEN_ENTRY_MISS,
    PRIVILEGE_ENTRY_HIT = 8200,
    PRIVILEGE_ENTRY_MISS,
    PRIVILEGE_PAIR_FAILED
}

// Creates sudo
export const sudo = randomBytes(32).toBase64();

// Defines user methods
export async function createUser(name: string, pass: string): Promise<void> {
    // Validates name
    if(!/^[a-zA-Z0-9_]{3,}$/.test(name)) throw Except.USER_NAME_INVALID;
    
    // Hashes pass
    if(pass.length < 6) throw Except.USER_PASS_INVALID;
    const hash = await Bun.password.hash(pass);

    // Spawns uuid
    const uuid = Bun.randomUUIDv7();

    // Writes commit
    try {
        database.prepare(`
            INSERT INTO users VALUES ($name, $hash, $uuid);    
        `).run({ hash, name, uuid });
    }
    catch {
        throw Except.USER_ENTRY_HIT;
    }
}
export async function renameUser(name: string, pass: string, rename: string): Promise<void> {
    // Verifies user
    if(!await verifyUser(name, pass)) throw Except.USER_PASS_FAILED;

    // Validates name
    if(!/^[a-zA-Z0-9_]{3,}$/.test(rename)) throw Except.USER_NAME_INVALID;
    
    // Writes commit
    try {
        database.prepare(`
            UPDATE users SET name = $rename WHERE name = $name;
        `).run({ name, rename });
    }
    catch {
        throw Except.USER_ENTRY_HIT;
    }
}
export async function repassUser(name: string, pass: string, repass: string): Promise<void> {
    // Verifies user
    if(!await verifyUser(name, pass)) throw Except.USER_PASS_FAILED;

    // Hashes pass
    if(repass.length < 6) throw Except.USER_PASS_INVALID;
    const rehash = await Bun.password.hash(repass);
    
    // Writes commit
    try {
        database.prepare(`
            UPDATE users SET hash = $rehash WHERE name = $name;
        `).run({ name, rehash });
    }
    catch {
        throw Except.USER_ENTRY_HIT;
    }
}
export async function deleteUser(name: string, pass: string): Promise<void> {
    // Verifies user
    if(!await verifyUser(name, pass)) throw Except.USER_PASS_FAILED;

    // Writes commit
    try {
        database.prepare(`
            DELETE FROM users WHERE name = $name;
        `).run({ name });
    }
    catch {
        throw Except.USER_ENTRY_MISS;
    }
}
export async function verifyUser(name: string, pass: string): Promise<boolean> {
    // Verifies pass
    const user = database.query(`
        SELECT hash FROM users WHERE name = $name;
    `).get({ name }) as {
        hash: string;
    } | null;
    if(user === null) throw Except.USER_ENTRY_MISS;
    return await Bun.password.verify(pass, user.hash);

}
export function uniqueUser(name: string): string {
    // Retrieves uuid
    const user = database.query(`
        SELECT uuid FROM users WHERE name = $name;
    `).get({ name }) as {
        uuid: string;
    } | null;
    if(user === null) throw Except.USER_ENTRY_MISS;
    return user.uuid;
}
export function lookupUser(uuid: string): string {
    // Retrieves name
    const user = database.query(`
        SELECT name FROM users WHERE uuid = $uuid;
    `).get({ uuid }) as {
        name: string;
    } | null;
    if(user === null) throw Except.USER_ENTRY_MISS;
    return user.name;
}

// Defines token methods
export async function generateToken(name: string, pass: string): Promise<void> {
    // Verifies user
    if(!await verifyUser(name, pass)) throw Except.USER_PASS_FAILED;

    // Generates token
    const code = randomBytes(32).toString("base64");
    const sign = encryptToken(code, pass);
    const mask = obfuscateToken(code);

    // Writes commit
    try {
        database.prepare(`
            INSERT INTO tokens VALUES ($mask, $sign, $name)
                ON CONFLICT (name) DO UPDATE SET mask = $mask, sign = $sign WHERE name = $name;
        `).run({ mask, name, sign });
    }
    catch {
        throw Except.TOKEN_ENTRY_HIT;
    }
}
export async function retrieveToken(name: string, pass: string): Promise<string> {
    // Verifies user
    if(!await verifyUser(name, pass)) throw Except.USER_PASS_FAILED;

    // Reveals code
    const token = database.query(`
        SELECT sign FROM tokens WHERE name = $name;
    `).get({ name }) as {
        sign: string;
    } | null;
    if(token === null) throw Except.TOKEN_ENTRY_MISS;
    return decryptToken(token.sign, pass);
}
export function encryptToken(code: string, pass: string): string {
    // Creates cipher
    const key = createHash("sha-256").update(Buffer.from(pass, "utf8")).digest("hex");
    const vector = randomBytes(16).toString("hex");
    const cipher = createCipheriv(
        "aes-256-gcm",
        Buffer.from(key, "hex"),
        Buffer.from(vector, "hex")
    );
    
    // Encrypts code
    const warp = cipher.update(code, "base64", "hex") + cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    return [ warp, vector, tag ].join(";");
}
export function decryptToken(sign: string, pass: string): string {
    // Creates decipher
    const [ warp, vector, tag ] = sign.split(";");
    const key = createHash("sha-256").update(Buffer.from(pass, "utf8")).digest("hex");
    const decipher = createDecipheriv(
        "aes-256-gcm",
        Buffer.from(key, "hex"),
        Buffer.from(vector, "hex")
    );
    
    // Decrypts code
    decipher.setAuthTag(Buffer.from(tag, "hex"));
    return decipher.update(warp, "hex", "base64") + decipher.final("base64");
}
export function obfuscateToken(code: string): string {
    // Obfuscates code
    return createHash("sha-256").update(Buffer.from(code, "base64")).digest("hex");
}
export function identifyToken(code: string): string {
    // Obfuscates code
    const mask = obfuscateToken(code);

    // Identifies user
    const token = database.query(`
        SELECT name FROM tokens WHERE mask = $mask;
    `).get({ mask }) as {
        name: string;
    } | null;
    if(token === null) throw Except.TOKEN_ENTRY_MISS;
    return token.name;
}

// Defines privilege methods
export function allowPrivilege(code: string, pkey: string, pval: string, auth: string): void {
    // Checks privilege
    if(
        auth !== sudo &&
        checkPrivilege(code, "system-admin") !== "1" &&
        checkPrivilege(code, "manage-privilege") !== "1"
    ) throw Except.PRIVILEGE_PAIR_FAILED;

    // Obfuscates code
    const mask = obfuscateToken(code);

    // Writes commit
    try {
        database.prepare(`
            INSERT INTO privileges VALUES ($mask, $pkey, $pval)
                ON CONFLICT (mask, pkey) DO UPDATE SET pval = $pval WHERE mask = $mask AND pkey = $pkey;
        `).run({ mask, pkey, pval });
    }
    catch {
        throw Except.PRIVILEGE_ENTRY_HIT;
    }
}
export function denyPrivilege(code: string, pkey: string, auth: string): void {
    // Checks privilege
    if(
        auth !== sudo &&
        checkPrivilege(code, "system-admin") !== "1" &&
        checkPrivilege(code, "manage-privilege") !== "1"
    ) throw Except.PRIVILEGE_PAIR_FAILED;

    // Obfuscates code
    const mask = obfuscateToken(code);

    // Writes commit
    try {
        database.prepare(`
            DELETE FROM privileges WHERE mask = $mask AND pkey = $pkey;
        `).run({ mask, pkey });
    }
    catch {
        throw Except.PRIVILEGE_ENTRY_MISS;
    }
}
export function checkPrivilege(code: string, pkey: string): string | null {
    // Obfuscates code
    const mask = obfuscateToken(code);

    // Checks privilege
    const privilege = database.query(`
        SELECT pval FROM privileges WHERE mask = $mask AND pkey = $pkey;
    `).get({ mask, pkey }) as {
        pval: string;
    } | null;
    return privilege === null ? null : privilege.pval;
}
export function listPrivileges(code: string): { [ pkey in string ]: string; } {
    // Obfuscates code
    const mask = obfuscateToken(code);

    // Fetches privileges
    const privileges = database.query(`
        SELECT pval, pkey FROM privileges WHERE mask = $mask;
    `).all({ mask }) as {
        pval: string;
        pkey: string;
    }[];

    // Creates pairs
    const pairs: { [ pkey in string ]: string; } = {};
    for(let i = 0; i < privileges.length; i++)
        pairs[privileges[i].pkey] = privileges[i].pval;
    return pairs;
}

// Initializes database
database.run(`
    /* Pragmas */
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    /* Users */
    CREATE TABLE IF NOT EXISTS users (
        name TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL UNIQUE,
        uuid TEXT NOT NULL UNIQUE,
        PRIMARY KEY (name)
    );

    /* Tokens */
    CREATE TABLE IF NOT EXISTS tokens (
        mask TEXT NOT NULL UNIQUE,
        sign TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL UNIQUE,
        FOREIGN KEY (name)
            REFERENCES users (name)
                ON UPDATE CASCADE
                ON DELETE CASCADE,
        PRIMARY KEY (mask)
    );

    /* Privileges */
    CREATE TABLE IF NOT EXISTS privileges (
        mask TEXT NOT NULL,
        pkey TEXT NOT NULL,
        pval TEXT NOT NULL,
        FOREIGN KEY (mask)
            REFERENCES tokens (mask)
                ON UPDATE CASCADE
                ON DELETE CASCADE,
        PRIMARY KEY (mask, pkey)
    );
`);
