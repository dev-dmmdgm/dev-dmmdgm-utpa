// Imports
import chalk from "chalk";
import { read } from "read";
import * as core from "./core";

// Defines helpers
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
export async function execute(callback: () => Promise<boolean>): Promise<boolean> {
    // Resolves process
    try {
        const result = await callback();
        return result;
    }
    catch(error) {
        if(typeof error !== "number") return false;
        const text = core.exceptText[error as core.ExceptCode];
        const type = core.exceptType[error as core.ExceptCode];
        warning(`${text} (${type})`);
        return false;
    }
}

// Creates registrar
const registrar: { [ command in string ]: {
    group: string;
    hint: string;
    run: (parameters: string[]) => Promise<boolean>;
    usage: string;
}; } = {
    // Defines user methods
    "create": {
        group: "user",
        usage: "create [name]",
        hint: "Creates a new user, then return its code in the console.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "user",
        usage: "rename [name] [rename]",
        hint: "Changes a user's name, then returns its code in the console.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "user",
        usage: "repass [name]",
        hint: "Changes a user's pass, then regenerates and returns its code in the console.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "user",
        usage: "delete [name]",
        hint: "Deletes a user forever.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "user",
        usage: "unique [name]",
        hint: "Fetches a user's UUID from name.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "user",
        usage: "lookup [name]",
        hint: "Fetches a user's name from UUID.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "token",
        usage: "generate [name]",
        hint: "Generates a user's token and return its code in the console.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "token",
        usage: "retrieve [name]",
        hint: "Returns a user's code in the console.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "token",
        usage: "identify",
        hint: "Identifies a user's name from code.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "privilege",
        usage: "allow [pkey] [pval]",
        hint: "Allows or updates a token's privilege.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "privilege",
        usage: "deny [pkey]",
        hint: "Deletes a token's privilege forever.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "privilege",
        usage: "check [pkey]",
        hint: "Returns a token's privilege pval from privilege pkey.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "privilege",
        usage: "list",
        hint: "Returns all token's privilege pkey and pval pairs.",
        run: (parameters: string[]) => execute(async () => {
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
        group: "general",
        usage: "help [command]",
        hint: "Displays more information about commands.",
        run: (parameters: string[]) => execute(async () => {
            // Prints header
            exclaim("=== Help ===");

            // Prints menu
            if(parameters.length === 0) {
                // Initializes menu
                const branches: { [ group in string ]: typeof registrar[string][]; } = {};

                // Classifies menu
                for(let command in registrar) {
                    const control = registrar[command];
                    const group = control.group;
                    if(group in branches) branches[group].push(control);
                    else branches[group] = [ control ];
                }

                // Prints menu
                for(let group in branches) {
                    const branch = branches[group];
                    display(group);
                    for(let i = 0; i < branch.length; i++) {
                        const control = branch[i];
                        display("    " + control.usage);
                        suggest("        " + control.hint);
                    }
                    display("");
                }
                return true;
            }

            // Prints details
            const command = parameters[0];
            if(command in registrar) {
                const control = registrar[command];
                display(control.usage);
                suggest("    " + control.hint);
                display("");
                return true;
            }

            return false;
        })
    }
}

// Defines handler
export async function interpret(command: string, parameters: string[]): Promise<boolean> {
    // Runs command
    if(command in registrar)
        return await registrar[command].run(parameters);
    
    // Displays fallback message
    warning(`Invalid command '${command}'.`);
    return false;
}

// Interprets command
if(import.meta.main) {
    const [ command, ...parameters ] = process.argv.slice(2);
    const success = await interpret(command, parameters);
    process.exit(success ? 0 : 1);
}

// Exports
export {};
