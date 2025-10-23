// Imports
import chalk from "chalk";
import nodeReadline from "node:readline/promises";
import * as core from "./base";

// Creates readline
const readline = nodeReadline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Defines handler
const [ command, ...parameters ] = process.argv.slice(2);
switch(command.toLowerCase()) {
    // Defines user methods
    case "create": {}
    case "rename": {}
    case "repass": {}
    case "delete": {}
    case "unique": {}
    case "lookup": {}
    case "generate": {}
    case "retrieve": {}
    case "identify": {}
    case "allow": {}
    case "deny": {}
    case "check": {}
    case "list": {}
    case "help": {}
    default: {}
}

// Exports
export {};
