// Imports
import BunSqlite from "bun:sqlite";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

// Creates database
export const database = new BunSqlite("database.sqlite");

// Creates sudo
export const sudo = randomBytes(32).toBase64();

// Defines user methods
export function createUser(name: string, pass: string): void {
    // Checks parameters
    if(!/^[a-zA-Z0-9_]{3,}$/.test(name)) throw new Error("Bad")
    try {
        // Checks username

    }
    catch {

    }
}
export function renameUser(name: string, pass: string, rename: string): void {

}
export function repassUser(name: string, pass: string, repass: string): void {

}
export function deleteUser(name: string, pass: string): void {

}

// Defines token methods
export function generateToken(name: string, pass: string): void {

}
export function retrieveToken(name: string, pass: string): string {

}
export function encryptToken(code: string, pass: string): string {

}
export function decryptToken(sign: string, pass: string): string {

}
export function obfuscateToken(code: string): string {

}

// Defines privilege methods
export function allowPrivilege(code: string, auth: string, pkey: string, pval: string): void {

}
export function checkPrivilege(code: string, auth: string, pkey: string): string {

}
export function denyPrivilege(code: string, auth: string, pkey: string): void {

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
        pval TEXT NOT NULL
        FOREIGN KEY (mask)
            REFERENCES tokens (mask)
                ON UPDATE CASCADE
                ON DELETE CASCADE,
        PRIMARY KEY (mask, pkey)
    );
`);
