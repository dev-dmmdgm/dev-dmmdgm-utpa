// Imports
import chalk from "chalk";
import nodeReadline from "node:readline/promises";
import { createUser, Exception, Label, verifyUser } from "./core";

// Creates readline
const readline = nodeReadline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Defines handler
const [ command, ...parameters ] = process.argv.slice(2);
switch(command.toLowerCase()) {
    // Defines user methods
    case "create": {
        // Prints header
        process.stdout.write(
            chalk.cyan("=== Creating a User ===") + "\n" +
            chalk.gray("Please enter your desired name and pass as prompted.") + "\n" +
            chalk.gray("Note that your name must be unique and can only contain") + "\n" +
            chalk.gray("English alphabets, numerical symbols, and underscores.") + "\n" +
            chalk.gray("Your pass must also be at least 6 characters in length.") + "\n\n"
        );
        
        // Inquires details
        const name = await readline.question(chalk.yellow("Please enter your name: "));
        const pass = await readline.question(chalk.yellow("Please enter your pass: \x1b[8m\x1b[?25l"));
        process.stdout.write("\x1b[28m\x1b[?25h");
        const checkPass = await readline.question(chalk.yellow("Please confirm your pass: \x1b[8m\x1b[?25l"));
        process.stdout.write("\x1b[28m\x1b[?25h" + "\n");

        // Creates user
        try {
            if(pass !== checkPass) throw new Exception(Label.USER_UNCONFIRMED);
            await createUser(name, pass);
            process.stdout.write(chalk.green("Done!"));
            process.exit(0);
        }
        catch(error) {
            if(!(error instanceof Exception)) throw error;
            switch(error.label) {
                case Label.USER_BAD_NAME: {
                    process.stdout.write(
                        chalk.red("Name contains illegal characters.") + "\n" +
                        chalk.red("Please choose another name.") + "\n" +
                        chalk.red("User creation aborted.")
                    );
                    process.exit(1);
                }
                case Label.USER_BAD_NAME: {
                    process.stdout.write(
                        chalk.red("Pass is too short.") + "\n" +
                        chalk.red("Please choose another pass.") + "\n" +
                        chalk.red("User creation aborted.")
                    );
                    process.exit(1);
                }
                case Label.USER_COLLIDED: {
                    process.stdout.write(
                        chalk.red("A user with that name already exists.") + "\n" +
                        chalk.red("Please choose another name.") + "\n" +
                        chalk.red("User creation aborted.")
                    );
                    process.exit(1);
                }
                case Label.USER_UNCONFIRMED: {
                    process.stdout.write(
                        chalk.red("Your passes did not match.") + "\n" +
                        chalk.red("Please check your spelling.") + "\n" +
                        chalk.red("User creation aborted.")
                    );
                    process.exit(1);
                }
                default: {
                    throw error;
                }
            }
        }
    }
    case "verify": {
        // Prints header
        process.stdout.write(
            chalk.cyan("=== Verifying Your User ===") + "\n" +
            chalk.gray("Please enter your name and pass as prompted.") + "\n" +
            chalk.gray("Completing this verification will result in") + "\n" +
            chalk.gray("your token being printed in this console.") + "\n" +
            chalk.gray("Try to keep your token safe. In case of a compromise, ") + "\n" +
            chalk.gray("please run 'generate' to create a new token.") + "\n\n"
        );
        
        // Inquires details
        const name = await readline.question(chalk.yellow("Please enter your name: "));
        const pass = await readline.question(chalk.yellow("Please enter your pass: \x1b[8m\x1b[?25l"));
        process.stdout.write("\x1b[28m\x1b[?25h" + "\n");

        // Verifies user
        try {
            const code = await verifyUser(name, pass);
            process.stdout.write(chalk.green(code));
            process.exit(0);
        }
        catch(error) {
            if(!(error instanceof Exception)) throw error;
            switch(error.label) {
                case Label.USER_MISSING: {
                    process.stdout.write(
                        chalk.red("No such user found.") + "\n" +
                        chalk.red("Please check your spelling.") + "\n" +
                        chalk.red("User verification aborted.")
                    );
                    process.exit(1);
                }
                case Label.USER_UNPERMITTED: {
                    process.stdout.write(
                        chalk.red("Pass incorrect.") + "\n" +
                        chalk.red("User verification aborted.")
                    );
                    process.exit(1);
                }
                case Label.TOKEN_MISSING: {
                    process.stdout.write(
                        chalk.red("It seems like your user is corrupted.") + "\n" +
                        chalk.red("Consider recreating your user entirely.") + "\n" +
                        chalk.red("User verification aborted.")
                    );
                    process.exit(1);
                }
                default: {
                    throw error;
                }
            }
        }

        // Exits
        process.stdout.write(
            chalk.green("Done!")
        );
        process.exit(0);
    }
}

// Exports
export {};
