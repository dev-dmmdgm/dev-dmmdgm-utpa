// Imports
import * as base from "./base";

// Extends sudo
export const sudo = base.sudo;

// Overrides user methods
export async function createUser(name: string, pass: string): Promise<string> {
    // Creates user
    await base.createUser(name, pass);
    const uuid = base.uniqueUser(name);

    // Generates token
    base.generateToken(name, pass);
    const code = await base.retrieveToken(name, pass);

    // Allows privilege
    base.allowPrivilege(code, "uuid", uuid, base.sudo);

    // Returns code
    return code;
}
export async function renameUser(name: string, pass: string, rename: string): Promise<string> {
    // Renames user
    await base.renameUser(name, pass, rename);

    // Retrieves token
    const code = await base.retrieveToken(rename, pass);

    // Returns code
    return code;
}
export async function repassUser(name: string, pass: string, repass: string): Promise<string> {
    // Repasses user
    await base.repassUser(name, pass, repass);

    // Generates token
    await base.generateToken(name, repass);
    const code = await base.retrieveToken(name, repass);
    
    // Returns code
    return code;
}
export async function deleteUser(name: string, pass: string): Promise<void> {
    // Deletes uesr
    await base.deleteUser(name, pass);
}
export function uniqueUser(name: string): string {
    // Fetches uuid
    const uuid = base.uniqueUser(name);
    return uuid;
}
export function lookupUser(uuid: string): string {
    // Fetches name
    const name = base.lookupUser(uuid);
    return name;
}

// Overrides token methods
export async function generateToken(name: string, pass: string): Promise<string> {
    // Generates token
    await base.generateToken(name, pass);
    const code = await base.retrieveToken(name, pass);

    // Returns code
    return code;
}
export async function retrieveToken(name: string, pass: string): Promise<string> {
    // Retrieves token
    const code = await base.retrieveToken(name, pass);
    
    // Returns code
    return code;
}
export function identifyToken(code: string): string {
    // Identifies token
    const name = base.identifyToken(code);
    
    // Returns name
    return name;
}

// Overrides privilege methods
export function allowPrivilege(code: string, pkey: string, pval: string, auth: string): void {
    // Allows privilege
    base.allowPrivilege(code, pkey, pval, auth);
}
export function denyPrivilege(code: string, pkey: string, auth: string): void {
    // Denies privilege
    base.denyPrivilege(code, pkey, auth);
}
export function checkPrivilege(code: string, pkey: string): string | null {
    // Checks privilege
    const pval = base.checkPrivilege(code, pkey);
    
    // Returns pval
    return pval;
}
export function listPrivileges(code: string): { [ pkey: string ]: string } {
    // List privileges
    const pairs = base.listPrivileges(code);
    
    // Returns pairs
    return pairs;
}
