// Imports
import BunSqlite from "bun:sqlite";
import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

// Defines types
export interface User {
    hash: string;
    name: string;
    uuid: string;
}
export interface Token {
    auth: string;
    mask: string;
    sign: string;
    uuid: string;
    warp: string;
}
export interface Armor {
    auth: string;
    sign: string;
    warp: string;
}
export interface Privilege {
    mask: string;
    pkey: string;
    pval: string;
}

// Defines exceptions
export enum Label {
    USER_BAD_NAME,
    USER_BAD_PASS,
    USER_COLLIDED,
    USER_MISSING,
    USER_UNCONFIRMED,
    USER_UNPERMITTED,
    TOKEN_MISSING,
    TOKEN_UNPERMITTED,
    PRIVILEGE_MISSING
}
export class Exception extends Error {
    // Defines constructor
    readonly label: Label;
    constructor(label: Label) {
        // Initializes instance
        super();
        this.label = label;
    }
}

// Creates database
export const database = new BunSqlite("database.sqlite", {
    create: true,
    strict: true
});

// Defines sudo
export const sudo = randomBytes(32).toString("base64");

// Defines user methods
export async function createUser(name: string, pass: string): Promise<User> {
    // Initializes user uuid
    const uuid = Bun.randomUUIDv7();
    
    // Checks collision
    const user = lookupUserName(name);
    if(user !== null) throw new Exception(Label.USER_COLLIDED);
    
    // Processes user data
    if(!/^[a-zA-Z0-9_]+$/.test(name)) throw new Exception(Label.USER_BAD_NAME);
    if(pass.length < 6) throw new Exception(Label.USER_BAD_PASS);
    const hash = await Bun.password.hash(pass);
    
    // Writes commit
    database.prepare(`
        INSERT INTO users VALUES ($uuid, $name, $hash);
    `).run({ hash, name, uuid });

    // Generates token
    const token = generateToken(uuid, pass);
    
    // Configures privilege
    const code = softenTokenArmor(token, pass);
    allowPrivilege(code, "uuid", uuid, sudo);

    // Returns user
    return { hash, name, uuid };
}
export async function verifyUser(name: string, pass: string): Promise<string> {
    // Fetches user
    const user = lookupUserName(name);
    if(user === null) throw new Exception(Label.USER_MISSING);
    
    // Processes user data
    const { hash, uuid } = user;
    if(!await Bun.password.verify(pass, hash)) throw new Exception(Label.USER_UNPERMITTED);
    
    // Fetches token
    const token = acquireTokenUUID(uuid);
    if(token === null) throw new Exception(Label.TOKEN_MISSING);
    
    // Proceses token data
    const code = softenTokenArmor(token, pass);
    
    // Returns code
    return code;
}
export async function updateUserName(name: string, pass: string, newName: string): Promise<User> {
    // Fetches user
    const user = lookupUserName(name);
    if(user === null) throw new Exception(Label.USER_MISSING);
    
    // Processes user data
    const { hash, uuid } = user;
    if(!await Bun.password.verify(pass, hash)) throw new Exception(Label.USER_UNPERMITTED);
    if(!/^[a-zA-Z0-9_]+$/.test(name)) throw new Exception(Label.USER_BAD_NAME);
    
    // Writes commit
    database.prepare(`
        UPDATE users SET name = $newName WHERE uuid = $uuid;
    `).run({ newName, uuid });

    // Returns user
    return { name: newName, hash, uuid };
}
export async function updateUserPass(name: string, pass: string, newPass: string): Promise<User> {
    // Fetches user
    const user = lookupUserName(name);
    if(user === null) throw new Exception(Label.USER_MISSING);
    
    // Processes user data
    const { hash, uuid } = user;
    if(!await Bun.password.verify(pass, hash)) throw new Exception(Label.USER_UNPERMITTED);
    if(newPass.length < 6) throw new Exception(Label.USER_BAD_PASS);
    const newHash = await Bun.password.hash(newPass);
    
    // Writes commit
    database.prepare(`
        UPDATE users SET hash = $newHash WHERE uuid = $uuid;
    `).run({ newHash, uuid });

    // Regenerates token
    generateToken(uuid, newPass);

    // Returns user
    return { name, hash: newHash, uuid };
}
export async function deleteUser(name: string, pass: string): Promise<void> {
    // Fetches user
    const user = lookupUserName(name);
    if(user === null) throw new Exception(Label.USER_MISSING);
    
    // Processes user data
    const { hash, uuid } = user;
    if(!await Bun.password.verify(pass, hash)) throw new Exception(Label.USER_UNPERMITTED);

    // Writes commit
    database.prepare(`
        DELETE FROM users WHERE uuid = $uuid;
    `).run({ uuid });
}
export function lookupUserUUID(uuid: string): User | null {
    // Fetches user
    const user = database.query(`
        SELECT * FROM users WHERE uuid = $uuid;
    `).get({ uuid }) as User | null;
    return user;
}
export function lookupUserName(name: string): User | null {
    // Fetches user
    const user = database.query(`
        SELECT * FROM users WHERE name = $name;
    `).get({ name }) as User | null;
    return user;
}
export function revealUsers(size: number = 25, page: number = 0): User[] {
    // Fetches users
    const limit = size;
    const offset = size * page;
    const users = database.query(`
        SELECT * FROM users LIMIT $limit OFFSET $offset;
    `).all({ offset, limit }) as User[];
    return users;
}

// Defines token methods
export function generateToken(uuid: string, pass: string): Token {
    // Initializes token
    const code = randomBytes(32).toString("base64");
    const { auth, sign, warp } = hardenTokenArmor(code, pass);
    const mask = disguiseTokenMask(code);

    // Writes commit
    const token = acquireTokenUUID(uuid);
    if(token === null) database.prepare(`
        INSERT INTO tokens VALUES ($uuid, $warp, $auth, $sign, $mask);
    `).run({ auth, mask, sign, uuid, warp });
    else database.prepare(`
        UPDATE tokens SET warp = $warp, auth = $auth, sign = $sign, mask = $mask WHERE uuid = $uuid;
    `).run({ auth, mask, sign, uuid, warp });

    // Returns token
    return { auth, mask, sign, uuid, warp };
}
export function hardenTokenArmor(code: string, pass: string): Armor {
    // Creates token cipher
    const pick = createHash("sha-256").update(Buffer.from(pass, "utf8")).digest("hex");
    const warp = randomBytes(16).toString("hex");
    const lock = createCipheriv("aes-256-gcm", Buffer.from(pick, "hex"), Buffer.from(warp, "hex"));
    
    // Encrypts token string
    const sign = lock.update(code, "base64", "hex") + lock.final("hex");
    const auth = lock.getAuthTag().toString("hex");

    // Returns token
    return { auth, sign, warp };
}
export function softenTokenArmor(armor: Armor, pass: string): string {
    // Creates token decipher
    const { auth, sign, warp } = armor;
    const pick = createHash("sha-256").update(Buffer.from(pass, "utf8")).digest("hex");
    const lock = createDecipheriv("aes-256-gcm", Buffer.from(pick, "hex"), Buffer.from(warp, "hex"));
    lock.setAuthTag(Buffer.from(auth, "hex"));

    // Decrypts token string
    const code = lock.update(sign, "hex", "base64") + lock.final("base64");

    // Returns code
    return code;
}
export function disguiseTokenMask(code: string): string {
    // Hashes token string
    const mask = createHash("sha-256").update(Buffer.from(code, "base64")).digest("hex");
    
    // Returns mask
    return mask;
}
export function acquireTokenUUID(uuid: string): Token | null {
    // Fetches token
    const token = database.query(`
        SELECT * FROM tokens WHERE uuid = $uuid;
    `).get({ uuid }) as Token | null;
    return token;
}
export function acquireTokenMask(code: string): Token | null {
    // Fetches token
    const mask = disguiseTokenMask(code);
    const token = database.query(`
        SELECT * FROM tokens WHERE mask = $mask;
    `).get({ mask }) as Token | null;
    return token;
}

// Defines privilege methods
export function allowPrivilege(code: string, pkey: string, pval: string, power: string): Privilege {
    // Checks power permission
    const permitted =
    power === sudo ||
    checkPrivilege(power, "root") === "1" ||
    checkPrivilege(power, "manage-privilege") === "1";
    if(!permitted) throw new Exception(Label.TOKEN_UNPERMITTED);
    
    // Write commit
    const mask = disguiseTokenMask(code);
    const privilege = findPrivilege(code, pkey);
    if(privilege === null) database.prepare(`
        INSERT INTO privileges VALUES ($mask, $pkey, $pval);
    `).run({ mask, pkey, pval });
    else database.prepare(`
        UPDATE privileges SET pval = $pval WHERE mask = $mask and pkey = $pkey;
    `).run({ mask, pkey, pval });

    // Returns privilege
    return { mask, pkey, pval };
}
export function checkPrivilege(code: string, pkey: string): string | null {
    // Fetches privilege
    const privilege = findPrivilege(code, pkey);

    // Fetches pval
    if(privilege === null) return null;
    return privilege.pval;
}
export function denyPrivilege(code: string, pkey: string, power: string): void {
    // Checks power privilege
    const permitted =
        power === sudo ||
        checkPrivilege(power, "root") === "1" ||
        checkPrivilege(power, "manage-privilege") === "1";
    if(!permitted) throw new Exception(Label.TOKEN_UNPERMITTED);
    
    // Write commit
    const mask = disguiseTokenMask(code);
    const privilege = findPrivilege(code, pkey);
    if(privilege === null) throw new Exception(Label.PRIVILEGE_MISSING);
    database.prepare(`
        DELETE FROM users WHERE mask = $mask AND pkey = $pkey;
    `).run({ mask, pkey });
}
export function findPrivilege(code: string, pkey: string): Privilege | null {
    // Fetches privilege
    const mask = disguiseTokenMask(code);
    const privilege = database.query(`
        SELECT * FROM privileges WHERE mask = $mask AND pkey = $pkey;
    `).get({ mask, pkey }) as Privilege | null;
    return privilege;
} 
export function listPrivileges(code: string): Privilege[] {
    // Fetches privileges
    const mask = disguiseTokenMask(code);
    const privileges = database.query(`
        SELECT * FROM privileges WHERE mask = $mask;
    `).all({ mask }) as Privilege[];
    return privileges;
}

// Initializes database
database.run(`
    /* Pragmas */
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    /* Users */
    CREATE TABLE IF NOT EXISTS users (
        uuid TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        hash TEXT NOT NULL
    );

    /* Tokens */
    CREATE TABLE IF NOT EXISTS tokens (
        uuid TEXT PRIMARY KEY,
        warp TEXT NOT NULL,
        auth TEXT NOT NULL,
        sign TEXT NOT NULL UNIQUE,
        mask TEXT NOT NULL UNIQUE,
        FOREIGN KEY (uuid)
            REFERENCES users (uuid)
                ON UPDATE CASCADE
                ON DELETE CASCADE
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
