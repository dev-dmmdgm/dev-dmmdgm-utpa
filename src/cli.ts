// Imports
import chalk from "chalk";
import { read } from "read";
import * as core from "./core";

// Defines inputs
export async function inquire(prompt: string): Promise<string> {
    // Retrieves answer
    const answer = await read({
        prompt: chalk.yellow(prompt)
    });
    return answer;
}
export async function whisper(prompt: string): Promise<string> {
    // Retrieves answer
    const answer = await read({
        prompt: chalk.yellow(prompt),
        silent: true
    });
    process.stdout.write("\n");
    return answer;
}

// Defines outputs
export function exclaim(message: string): void {
    // Prints message
    process.stdout.write(chalk.cyan(message) + "\n");
}
export function display(message: string): void {
    // Prints message
    process.stdout.write(chalk.white(message) + "\n");
}
export function suggest(message: string): void {
    // Prints message
    process.stdout.write(chalk.gray(message) + "\n");
}
export function success(message: string): void {
    // Prints message
    process.stdout.write(chalk.green(message) + "\n");
}
export function enchant(message: string): void {
    // Prints message
    process.stdout.write(chalk.magenta(message) + "\n");
}
export function warning(message: string): void {
    // Prints message
    process.stdout.write(chalk.red(message) + "\n");
}

// Defines protector
export async function protect(execute: () => Promise<boolean>): Promise<boolean> {
    // Protects execution
    try {
        // Attempts execution
        const result = await execute();
        return result;
    }
    catch(error) {
        // Ignores error
        if(typeof error !== "number") return false;

        // Catches except
        const text = core.exceptTexts[error as core.ExceptCode] ?? core.exceptTexts[core.ExceptCode.EXCEPT_UNKNOWN];
        const type = core.exceptTypes[error as core.ExceptCode] ?? core.exceptTypes[core.ExceptCode.EXCEPT_UNKNOWN];
        warning(`${text} (${type})`);
        return false;
    }
}

// Creates registrar
export type Operand = {
    hint: string;
    slot: string;
    plug: (parameters: string[]) => Promise<boolean>;
    rule: string;
};
const registrar: { [ command in string ]: Operand; } = {
    // Defines user methods
    "create": {
        slot: "user",
        rule: "create [name]",
        hint: "Creates a new user, then return its code in the console.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Create User ===");
            suggest("- Name must be at least 3 characters (a-z, A-Z, 0-9, and _) in length.");
            suggest("- Pass must be at least 6 characters in length.");
            
            // Collects data
            const name = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please choose your name:");
            const pass = await whisper("Please choose your pass:");
            const conpass = await whisper("Please confirm your pass:");

            // Confirms pass
            if(pass !== conpass) {
                warning("Failed to confirm pass.");
                return false;
            }

            // Creates user
            const code = await core.createUser(name, pass);
            success("Successfully created!");
            enchant(code);
            return true;
        })
    },
    "rename": {
        slot: "user",
        rule: "rename [name] [rename]",
        hint: "Changes a user's name, then returns its code in the console.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Rename User ===");
            suggest("- Name must be at least 3 characters (a-z, A-Z, 0-9, and _) in length.");

            // Collects data
            const name = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter your old name:");
            const rename = typeof parameters[1] === "string" ?
                parameters[1] : await inquire("Please choose your new name:");
            const pass = await whisper("Please enter your pass:");

            // Renames user
            const code = await core.renameUser(name, pass, rename);
            success("Successfully renamed!");
            enchant(code);
            return true;
        })
    },
    "repass": {
        slot: "user",
        rule: "repass [name]",
        hint: "Changes a user's pass, then regenerates and returns its code in the console.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Repass User ===");
            suggest("- Pass must be at least 6 characters in length.");
            suggest("- This will invalidate your previous token.");

            // Collects data
            const name = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = await whisper("Please enter your old pass:");
            const repass = await whisper("Please choose your new pass:");
            const conrepass = await whisper("Please confirm your new pass:");

            // Confirms pass
            if(repass !== conrepass) {
                warning("Failed to confirm repass.");
                return false;
            }

            // Repasses user
            const code = await core.repassUser(name, pass, repass);
            success("Successfully repassed!");
            enchant(code);
            return true;
        })
    },
    "delete": {
        slot: "user",
        rule: "delete [name]",
        hint: "Deletes a user forever.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Delete User ===");
            suggest("- You cannot undo this operation!");

            // Collects data
            const name = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = await whisper("Please enter your pass:");

            // Deletes user
            await core.deleteUser(name, pass);
            success("Successfully deleted!");
            return true;
        })
    },
    "unique": {
        slot: "user",
        rule: "unique [name]",
        hint: "Fetches a user's UUID from name.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Fetch User UUID ===");
            
            // Collects data
            const name = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter a name:");

            // Fetches UUID
            const uuid = core.uniqueUser(name);
            success("User found!");
            enchant(uuid);
            return true;
        })
    },
    "lookup": {
        slot: "user",
        rule: "lookup [name]",
        hint: "Fetches a user's name from UUID.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Fetch User Name ===");
            
            // Collects data
            const uuid = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter a uuid:");

            // Fetches name
            const name = core.lookupUser(uuid);
            success("User found!");
            enchant(name);
            return true;
        })
    },
    
    // Defines token methods
    "generate": {
        slot: "token",
        rule: "generate [name]",
        hint: "Generates a user's token and return its code in the console.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Generate Token ===");
            suggest("- This will invalidate your previous token.");
            
            // Collects data
            const name = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = await whisper("Please enter your pass:");

            // Generates token
            const code = await core.generateToken(name, pass);
            success("Successfully generated!");
            enchant(code);
            return true;
        })
    },
    "retrieve": {
        slot: "token",
        rule: "retrieve [name]",
        hint: "Returns a user's code in the console.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Retrieve Token ===");
            
            // Collects data
            const name = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter your name:");
            const pass = await whisper("Please enter your pass:");

            // Retrieves token
            const code = await core.retrieveToken(name, pass);
            success("Successfully retrieved!");
            enchant(code);
            return true;
        })
    },
    "identify": {
        slot: "token",
        rule: "identify",
        hint: "Identifies a user's name from code.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Identify Token ===");
            
            // Collects data
            const code = await whisper("Please enter a code:");

            // Identifies token
            const name = core.identifyToken(code);
            success("Token found!");
            enchant(name);
            return true;
        })
    },
    
    // Defines privilege methods
    "allow": {
        slot: "privilege",
        rule: "allow [pkey] [pval]",
        hint: "Allows or updates a token's privilege.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Allow Privilege ===");
            suggest("- You are now running in sudo mode.");
            
            // Collects data
            const code = await whisper("Please enter a code:");
            const pkey = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter a pkey:");
            const pval = typeof parameters[1] === "string" ?
                parameters[1] : await inquire("Please enter a pval:");

            // Allows privilege
            core.allowPrivilege(code, pkey, pval, core.sudo);
            success("Successfully allowed!");
            return true;
        })
    },
    "deny": {
        slot: "privilege",
        rule: "deny [pkey]",
        hint: "Deletes a token's privilege forever.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Deny Privilege ===");
            suggest("- You are now running in sudo mode.");
            
            // Collects data
            const code = await whisper("Please enter a code:");
            const pkey = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter a pkey:");

            // Denies privilege
            core.denyPrivilege(code, pkey, core.sudo);
            success("Successfully denied!");
            return true;
        })
    },
    "check": {
        slot: "privilege",
        rule: "check [pkey]",
        hint: "Returns a token's privilege pval from privilege pkey.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Check Privilege ===");
            
            // Collects data
            const code = await whisper("Please enter a code:");
            const pkey = typeof parameters[0] === "string" ?
                parameters[0] : await inquire("Please enter a pkey:");

            // Checks privilege
            const pval = core.checkPrivilege(code, pkey);
            success("Privilege found!");
            enchant(`${pkey} = ${JSON.stringify(pval)}`);
            return true;
        })
    },
    "list": {
        slot: "privilege",
        rule: "list",
        hint: "Returns all token's privilege pkey and pval pairs.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== List Privileges ===");
            
            // Collects data
            const code = await whisper("Please enter a code:");

            // Lists privileges
            const pairs = core.listPrivileges(code);
            success("Privilege found!");
            for(let pkey in pairs)
                enchant(`${pkey} = ${JSON.stringify(pairs[pkey])}`);
            return true;
        })
    },
    
    // Defines general methods
    "help": {
        slot: "general",
        rule: "help [command]",
        hint: "Displays more information about commands.",
        plug: (parameters: string[]) => protect(async () => {
            // Prints header
            exclaim("=== Help ===");
            suggest("- Use help [command] for more specific details.");

            // Displays all
            if(parameters.length === 0) {
                // Initializes menu
                const slots: { [ slot in string ]: Operand[]; } = {};

                // Classifies menu
                for(let command in registrar) {
                    const operand = registrar[command];
                    const slot = operand.slot;
                    if(slot in slots) slots[slot].push(operand);
                    else slots[slot] = [ operand ];
                }

                // Prints menu
                for(let slot in slots) {
                    const operands = slots[slot];
                    display("");
                    display(slot);
                    for(let i = 0; i < operands.length; i++) {
                        const operand = operands[i];
                        display("  " + operand.rule);
                        suggest("    " + operand.hint);
                    }
                }
                return true;
            }

            // Displays one
            const command = parameters[0];
            if(command in registrar) {
                const operand = registrar[command];
                display("");
                display(operand.rule);
                suggest("  " + operand.hint);
                return true;
            }

            // Displays none 
            display("");
            warning("Command not found.");
            return false;
        })
    }
}

// Defines interpreter
export async function interpret(command: string, parameters: string[]): Promise<boolean> {
    // Plugs command
    if(command in registrar) {
        const result = await registrar[command].plug(parameters);
        return result;
    }
    
    // Displays fallback message
    warning(`Invalid command '${command}'.`);
    return false;
}

// Interprets command
if(import.meta.main) {
    const [ command, ...parameters ] = process.argv.slice(2);
    const result = await interpret(command, parameters);
    process.exit(result ? 0 : 1);
}

// Exports
export {};
