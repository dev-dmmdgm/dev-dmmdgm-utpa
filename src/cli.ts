#!/usr/bin/env bun

// Imports
import chalk, { ChalkInstance } from "chalk";
import { read } from "read";
import * as core from "./core";
import * as status from "./status";

// Defines ioputs
export async function inquire(prompt: string, secret: boolean = false): Promise<string> {
    // Retrieves answer
    const answer = await read({
        prompt: chalk.yellow(prompt),
        silent: secret
    });
    if(secret) process.stdout.write("\n");
    return answer;
}
export function display(message: string, style: ChalkInstance = chalk.white): void {
    // Prints message
    process.stdout.write(style(message) + "\n");
}

// Defines protector
export async function protect(execute: () => Promise<unknown>): Promise<unknown> {
    // Creates wrapper
    try {
        // Attempts execution
        const data = await execute();
        return data;
    }
    catch(error) {
        // Reports error
        const statusCode = typeof error === "number" && error in status.Code ?
            error as status.Code : status.Code.INTERNAL_ERROR;
        const statusText = status.texts[statusCode];
        const statusType = status.types[statusCode];
        display(`${statusText} (${statusType})`, chalk.red);
        return null;
    }
}

// Creates registrar
export type Operand = {
    hint: string;
    plug: (parameters: string[], sudo: boolean) => Promise<unknown>;
    rule: string;
    slot: string;
};
const registrar: { [ command in string ]: Operand; } = {
    // Defines user methods
    "create": {
        slot: "user",
        rule: "create [name]",
        hint: "Creates a new user.",
        plug: (parameters: string[]) => protect(async () => {            
            // Parses inputs
            const name = parameters.length >= 1 ?
                parameters[0] : await inquire("Please choose your name:");
            const pass = await inquire("Please choose your pass:", true);
            const conpass = await inquire("Please confirm your pass:", true);

            // Creates user
            if(pass !== conpass) throw status.Code.USER_PASS_MISMATCH;
            await core.createUser(name, pass);
            
            // Returns null
            display("Successfully created!", chalk.green);
            return null;
        })
    },
    "rename": {
        slot: "user",
        rule: "rename [name] [rename]",
        hint: "Changes a user's name.",
        plug: (parameters: string[], sudo: boolean) => protect(async () => {
            // Parses inputs
            const name = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter your old name:");
            const rename = parameters.length >= 2 ?
                parameters[1] : await inquire("Please choose your new name:");
            const pass = sudo ? "" : await inquire("Please enter your pass:", true);

            // Renames user
            if(!sudo && !await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            core.renameUser(name, rename);

            // Returns null
            display("Successfully renamed!", chalk.green);
            return null;
        })
    },
    "repass": {
        slot: "user",
        rule: "repass [name]",
        hint: "Changes a user's pass. This action will invalidate the user's previous token.",
        plug: (parameters: string[], sudo: boolean) => protect(async () => {
            // Parses inputs
            const name = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = sudo ? "" : await inquire("Please enter your old pass:", true);
            const repass = await inquire("Please choose your new pass:", true);
            const conrepass = await inquire("Please confirm your new pass:", true);

            // Repasses user
            if(pass !== conrepass) throw status.Code.USER_PASS_MISMATCH;
            if(!sudo && !await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            await core.repassUser(name, repass);

            // Returns null
            display("Successfully repassed!", chalk.green);
            return null;
        })
    },
    "delete": {
        slot: "user",
        rule: "delete [name]",
        hint: "Deletes a user forever.",
        plug: (parameters: string[], sudo: boolean) => protect(async () => {
            // Parses inputs
            const name = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = sudo ? "" : await inquire("Please enter your pass:", true);

            // Deletes user
            if(!sudo && !await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            core.deleteUser(name);

            // Returns null
            display("Successfully deleted!", chalk.green);
            return null;
        })
    },
    "unique": {
        slot: "user",
        rule: "unique [name]",
        hint: "Fetches a user's UUID and prints result in console.",
        plug: (parameters: string[]) => protect(async () => {
            // Parses inputs
            const name = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter a name:");

            // Fetches UUID
            const uuid = core.uniqueUser(name);

            // Returns UUID
            display("User found!", chalk.green);
            display(uuid, chalk.magenta);
            return uuid;
        })
    },
    "lookup": {
        slot: "user",
        rule: "lookup [name]",
        hint: "Fetches a user's name and prints result in console.",
        plug: (parameters: string[]) => protect(async () => {
            // Parses inputs
            const uuid = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter a uuid:");

            // Fetches name
            const name = core.uniqueUser(uuid);

            // Returns name
            display("User found!", chalk.green);
            display(name, chalk.magenta);
            return name;
        })
    },
    "obtain": {
        slot: "user",
        rule: "obtain [size] [page]",
        hint: "Fetches all user's UUIDs and prints results in console.",
        plug: (parameters: string[]) => protect(async () => {
            // Parses inputs
            const size = parameters.length >= 1 ?
                parseInt(parameters[0]) : parseInt(await inquire("Please enter a size number:"));
            const page = parameters.length >= 2 ?
                parseInt(parameters[1]) : parseInt(await inquire("Please enter a page number:"));

            // Fetches UUIDs
            if(isNaN(size) || isNaN(page)) throw status.Code.MALFORMED_PARAMETERS;
            if(size < 1 || page < 0) throw status.Code.MALFORMED_PARAMETERS;
            const uuids = core.obtainUsers(size, page);

            // Returns UUIDS
            display("Users found!", chalk.green);
            display(uuids.join(", "), chalk.magenta);
            return uuids;
        })
    },
    "reveal": {
        slot: "user",
        rule: "reveal [size] [page]",
        hint: "Fetches all user's names and prints results in console.",
        plug: (parameters: string[]) => protect(async () => {
            // Parses inputs
            const size = parameters.length >= 1 ?
                parseInt(parameters[0]) : parseInt(await inquire("Please enter a size number:"));
            const page = parameters.length >= 2 ?
                parseInt(parameters[1]) : parseInt(await inquire("Please enter a page number:"));

            // Fetches names
            if(isNaN(size) || isNaN(page)) throw status.Code.MALFORMED_PARAMETERS;
            if(size < 1 || page < 0) throw status.Code.MALFORMED_PARAMETERS;
            const names = core.revealUsers(size, page);

            // Returns names
            display("Users found!", chalk.green);
            display(names.join(", "), chalk.magenta);
            return names;
        })
    },
    
    // Defines token methods
    "generate": {
        slot: "token",
        rule: "generate [name]",
        hint: "Generates a user's token.",
        plug: (parameters: string[], sudo: boolean) => protect(async () => {
            // Parses inputs
            const name = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = await inquire("Please enter your pass:", true);

            // Generates token
            if(!sudo && !await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            core.generateToken(name, pass);

            // Returns null
            display("Successfully generated!", chalk.green);
            return null;
        })
    },
    "retrieve": {
        slot: "token",
        rule: "retrieve [name]",
        hint: "Retrieves a user's token and prints result in console.",
        plug: (parameters: string[], sudo: boolean) => protect(async () => {
            // Parses inputs
            const name = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = await inquire("Please enter your pass:", true);

            // Retrieves token
            if(!sudo && !await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            const code = core.retrieveToken(name, pass);
            
            // Returns code
            display("Successfully retrieved!", chalk.green);
            display(code, chalk.magenta);
            return code;
        })
    },
    "identify": {
        slot: "token",
        rule: "identify",
        hint: "Identifies a user's name from token code and prints result in console.",
        plug: () => protect(async () => {
            // Parses inputs
            const code = await inquire("Please enter a code:", true);

            // Identifies token
            const name = core.identifyToken(code);
            
            // Returns name
            display("Token found!", chalk.green);
            display(name, chalk.magenta);
            return name;
        })
    },
    
    // Defines privilege methods
    "allow": {
        slot: "privilege",
        rule: "allow [pkey] [pval]",
        hint: "Allows or updates a token's privilege.",
        plug: (parameters: string[], sudo: boolean) => protect(async () => {
            // Parses inputs
            const code = await inquire("Please enter a code:", true);
            const pkey = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter a pkey:");
            const pval = parameters.length >= 2 ?
                parameters[1] : await inquire("Please enter a pval:");
            const auth = sudo ? "" : await inquire("Please enter a code:", true);

            // Allows privilege
            if(!sudo && core.checkPrivilege(auth, "manage-privileges") !== "1") throw status.Code.TOKEN_CODE_BLOCKED;
            core.allowPrivilege(code, pkey, pval);
            
            // Returns null
            display("Successfully allowed!", chalk.green);
            return null;
        })
    },
    "deny": {
        slot: "privilege",
        rule: "deny [pkey]",
        hint: "Deletes a token's privilege forever.",
        plug: (parameters: string[], sudo: boolean) => protect(async () => {
            // Parses inputs
            const code = await inquire("Please enter a code:", true);
            const pkey = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter a pkey:");
            const auth = sudo ? "" : await inquire("Please enter a code:", true);

            // Denies privilege
            if(!sudo && core.checkPrivilege(auth, "manage-privileges") !== "1") throw status.Code.TOKEN_CODE_BLOCKED;
            core.denyPrivilege(code, pkey);
            
            // Returns null
            display("Successfully denied!", chalk.green);
            return null;
        })
    },
    "check": {
        slot: "privilege",
        rule: "check [pkey]",
        hint: "Fetches a privilege's pval and prints result in console.",
        plug: (parameters: string[]) => protect(async () => {
            // Parses inputs
            const code = await inquire("Please enter a code:", true);
            const pkey = parameters.length >= 1 ?
                parameters[0] : await inquire("Please enter a pkey:");

            // Checks privilege
            const pval = core.checkPrivilege(code, pkey);
            
            // Returns pval
            display("Privilege found!", chalk.green);
            display(`${pkey} = ${JSON.stringify(pval)}`, chalk.magenta);
            return pval;
        })
    },
    "list": {
        slot: "privilege",
        rule: "list",
        hint: "Fetches all privilege pairs and prints results in console.",
        plug: () => protect(async () => {
            // Parses inputs
            const code = await inquire("Please enter a code:", true);

            // Lists privileges
            const pairs = core.listPrivileges(code);
            
            // Returns pval
            display("Privileges found!", chalk.green);
            for(let pkey in pairs) display(`${pkey} = ${JSON.stringify(pairs[pkey])}`, chalk.magenta);
            return pairs;
        })
    },
    
    // Defines general methods
    "help": {
        slot: "general",
        rule: "help [command]",
        hint: "Displays more information about commands.",
        plug: (parameters: string[]) => protect(async () => {
            // Displays all
            if(parameters.length === 0) {
                // Initializes menu
                const slots: { [ slot in string ]: Operand[]; } = {};

                // Slots menu
                for(let command in registrar) {
                    const operand = registrar[command];
                    const slot = operand.slot;
                    if(slot in slots) slots[slot].push(operand);
                    else slots[slot] = [ operand ];
                }

                // Prints menu
                const sections: string[] = [];
                for(let slot in slots) {
                    const operands = slots[slot];
                    sections.push(`${slot}\n${operands.map((operand) => `  ${operand.rule}\n    ${operand.hint}`).join("\n")}`);
                }
                display(sections.join("\n\n"));
                return null;
            }

            // Displays one
            const command = parameters[0];
            if(command in registrar) {
                const operand = registrar[command];
                display(operand.rule);
                display("  " + operand.hint);
                return null;
            }

            // Displays none
            throw status.Code.MALFORMED_PARAMETERS;
        })
    },
    "sudo": {
        slot: "general",
        rule: "sudo <command> [...parameters]",
        hint: "Runs a command as sudo.",
        plug: (parameters: string[]) => protect(async () => {
            // Interprets command
            if(parameters.length === 0) throw status.Code.MALFORMED_PARAMETERS;
            const data = interpret(parameters[0], parameters.slice(1), true);
            return data;
        })
    }
}

// Defines interpreter
export async function interpret(command: string, parameters: string[], sudo: boolean = false): Promise<unknown> {
    // Plugs command
    return protect(async () => {
        if(command in registrar) {
            const data = await registrar[command].plug(parameters, sudo);
            return data;
        }
        else throw status.Code.METHOD_NOT_FOUND;
    });
}

// Interprets command
if(import.meta.main) {
    const [ command, ...parameters ] = process.argv.slice(2);
    await interpret(command ?? "help", parameters, false);
    process.exit(0);
}

// Exports
export {};
