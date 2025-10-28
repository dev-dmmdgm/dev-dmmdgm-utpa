// Imports
import BunSqlite from "bun:sqlite";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import * as except from "./except";

// Creates database
const database = new BunSqlite("database.sqlite", { strict: true });

// Defines user methods
export async function createUser(name: string, pass: string): Promise<void> {
    // Tests name
    if(!/^[a-zA-Z0-9_]{3,}$/.test(name)) throw except.Code.USER_NAME_INVALID;

    // Hashes pass
    if(pass.length < 6) throw except.Code.USER_PASS_INVALID;
    const hash = await Bun.password.hash(pass);

    // Spawns UUID
    const uuid = Bun.randomUUIDv7();

    // Writes to database
    try {
        database.prepare(`
            INSERT INTO users VALUES ($name, $hash, $uuid);
        `).run({ hash, name, uuid });
    }
    catch {
        throw except.Code.USER_CREATE_FAILED;
    }

    // Generates token
    generateToken(name, pass);
    const code = retrieveToken(name, pass);

    // Allows privilege
    allowPrivilege(code, "uuid", uuid);
}
export function renameUser(name: string, rename: string): void {
    // Tests rename
    if(!/^[a-zA-Z0-9_]{3,}$/.test(rename)) throw except.Code.USER_NAME_INVALID;

    // Writes to database
    try {
        database.prepare(`
            UPDATE users SET name = $rename WHERE name = $name;
        `).run({ name, rename });
    }
    catch {
        throw except.Code.USER_RENAME_FAILED;
    }
}
export async function repassUser(name: string, repass: string): Promise<void> {
    // Hashes repass
    if(repass.length < 6) throw except.Code.USER_PASS_INVALID;
    const rehash = await Bun.password.hash(repass);

    // Writes to database
    try {
        database.prepare(`
            UPDATE users SET hash = $rehash WHERE name = $name;
        `).run({ name, rehash });
    }
    catch {
        throw except.Code.USER_REPASS_FAILED;
    }

    // Generates token
    generateToken(name, repass);
}
export function deleteUser(name: string): void {
    // Writes to database
    try {
        database.prepare(`
            DELETE FROM users WHERE name = $name;
        `).run({ name });
    }
    catch {
        throw except.Code.USER_DELETE_FAILED;
    }
}
export async function verifyUser(name: string, pass: string): Promise<boolean> {
    // Reads from database
    const user = database.query(`
        SELECT hash FROM users WHERE name = $name;
    `).get({ name }) as {
        hash: string;
    } | null;
    if(user === null) throw except.Code.USER_ENTRY_MISSING;
    
    // Verifies pass
    return await Bun.password.verify(pass, user.hash);
}
export function uniqueUser(name: string): string {
    // Reads from database
    const user = database.query(`
        SELECT uuid FROM users WHERE name = $name;
    `).get({ name }) as {
        uuid: string;
    } | null;
    if(user === null) throw except.Code.USER_ENTRY_MISSING;
    
    // Returns UUID
    return user.uuid;
}
export function lookupUser(uuid: string): string {
    // Reads from database
    const user = database.query(`
        SELECT name FROM users WHERE uuid = $uuid;
    `).get({ uuid }) as {
        name: string;
    } | null;
    if(user === null) throw except.Code.USER_ENTRY_MISSING;

    // Returns name
    return user.name;
}
export function obtainUsers(size: number, page: number): string[] {
    // Reads from database
    const limit = size;
    const offset = size * page;
    const users = database.query(`
        SELECT uuid FROM users LIMIT $limit OFFSET $offset;
    `).all({ limit, offset }) as {
        uuid: string;
    }[];

    // Returns UUIDs
    return users.map((user) => user.uuid);
}
export function revealUsers(size: number, page: number): string[] {
    // Reads from database
    const limit = size;
    const offset = size * page;
    const users = database.query(`
        SELECT name FROM users LIMIT $limit OFFSET $offset;
    `).all({ limit, offset }) as {
        name: string;
    }[];

    // Returns names
    return users.map((user) => user.name);
}

// Defines token methods
export function generateToken(name: string, pass: string): void {
    // Generates token
    const code = randomBytes(32).toString("base64");
    const sign = encryptToken(code, pass);
    const mask = sourceToken(code);

    // Writes to database
    try {
        database.prepare(`
            INSERT INTO tokens VALUES ($mask, $sign, $name)
                ON CONFLICT (name) DO UPDATE SET mask = $mask, sign = $sign WHERE name = $name;
        `).run({ mask, name, sign });
    }
    catch {
        throw except.Code.TOKEN_GENERATE_FAILED;
    }
}
export function retrieveToken(name: string, pass: string): string {
    // Reads from database
    const token = database.query(`
        SELECT sign FROM tokens WHERE name = $name;
    `).get({ name }) as {
        sign: string;
    } | null;
    if(token === null) throw except.Code.TOKEN_ENTRY_MISSING;

    // Decrypts token
    return decryptToken(token.sign, pass);
}
export function identifyToken(code: string): string {
    // Sources token
    const mask = sourceToken(code);

    // Reads from database
    const token = database.query(`
        SELECT name FROM tokens WHERE mask = $mask;
    `).get({ mask }) as {
        name: string;
    } | null;
    if(token === null) throw except.Code.TOKEN_ENTRY_MISSING;

    // Returns name
    return token.name;
}
export function encryptToken(code: string, pass: string): string {
    // Encrypts token
    const salt = randomBytes(16).toString("hex");
    const key = createHash("sha-256").update(Buffer.from(pass + salt, "utf8")).digest("hex");
    const vector = randomBytes(16).toString("hex");
    const cipher = createCipheriv(
        "aes-256-gcm",
        Buffer.from(key, "hex"),
        Buffer.from(vector, "hex")
    );
    const warp = cipher.update(code, "base64", "hex") + cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");
    
    // Returns sign
    return [ warp, salt, vector, tag ].join(";");
}
export function decryptToken(sign: string, pass: string): string {
    // Decrypts token
    const [ warp, salt, vector, tag ] = sign.split(";");
    const key = createHash("sha-256").update(Buffer.from(pass + salt, "utf8")).digest("hex");
    const decipher = createDecipheriv(
        "aes-256-gcm",
        Buffer.from(key, "hex"),
        Buffer.from(vector, "hex")
    );
    decipher.setAuthTag(Buffer.from(tag, "hex"));
    
    // Returns code
    return decipher.update(warp, "hex", "base64") + decipher.final("base64");
}
export function sourceToken(code: string): string {
    // Returns mask
    return createHash("sha-256").update(Buffer.from(code, "base64")).digest("hex");
}

// Defines privilege methods
export function allowPrivilege(code: string, pkey: string, pval: string): void {
    // Sources token
    const mask = sourceToken(code);

    // Writes to database
    try {
        database.prepare(`
            INSERT INTO privileges VALUES ($mask, $pkey, $pval)
                ON CONFLICT (mask, pkey) DO UPDATE SET pval = $pval WHERE mask = $mask AND pkey = $pkey;
        `).run({ mask, pkey, pval });
    }
    catch {
        throw except.Code.PRIVILEGE_ALLOW_FAILED;
    }
}
export function denyPrivilege(code: string, pkey: string): void {
    // Sources token
    const mask = sourceToken(code);

    // Writes to database
    try {
        database.prepare(`
            DELETE FROM privileges WHERE mask = $mask AND pkey = $pkey;
        `).run({ mask, pkey });
    }
    catch {
        throw except.Code.PRIVILEGE_DENY_FAILED;
    }
}
export function checkPrivilege(code: string, pkey: string): string | null {
    // Sources token
    const mask = sourceToken(code);

    // Reads from database
    const privilege = database.query(`
        SELECT pval FROM privileges WHERE mask = $mask AND pkey = $pkey;
    `).get({ mask, pkey }) as {
        pval: string;
    } | null;

    // Returns pval
    return privilege === null ? null : privilege.pval;
}
export function listPrivileges(code: string): { [ pkey in string ]: string; } {
    // Sources token
    const mask = sourceToken(code);

    // Reads from database
    const privileges = database.query(`
        SELECT pval, pkey FROM privileges WHERE mask = $mask;
    `).all({ mask }) as {
        pval: string;
        pkey: string;
    }[];

    // Returns pairs
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
