// Imports
import { Context, Hono } from "hono";
import { validator } from "hono/validator";
import * as zod from "zod";
import * as core from "./core";
import * as status from "./status";

// Defines enforcer
export function enforce<SchemaType extends zod.ZodType>(schema: SchemaType) {
    // Validates schema
    const validate = validator("json", (value, context) => {
        // Parses value
        const result = schema.safeParse(value);
        if(!result.success) {
            const statusCode = status.Code.MALFORMED_BODY;
            const statusText = status.texts[statusCode];
            const statusType = status.types[statusCode];
            return context.json({
                data: null,
                status: {
                    code: statusCode,
                    text: statusText,
                    type: statusType
                }
            }, 400);
        }
        return result.data;
    });
    return validate;
}

// Defines protector
export async function protect(context: Context, execute: () => Promise<unknown>) {
    // Creates wrapper
    try {
        // Attempts execution
        const data = await execute();
        const statusCode = status.Code.ACTION_SUCCESSFUL;
        const statusText = status.texts[statusCode];
        const statusType = status.types[statusCode];
        return context.json({
            data: data,
            status: {
                code: statusCode,
                text: statusText,
                type: statusType
            }
        }, 200);
    }
    catch(error) {
        // Reports error
        const statusCode = typeof error === "number" && error in status.Code ?
            error as status.Code : status.Code.INTERNAL_ERROR;
        const statusText = status.texts[statusCode];
        const statusType = status.types[statusCode];
        return context.json({
            data: null,
            status: {
                code: statusCode,
                text: statusText,
                type: statusType
            }
        }, 400);
    }
}

// Creates server
export const app = new Hono()
    // Defines user methods
    .post(
        "/create",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { name, pass } = context.req.valid("json");
            
            // Creates user
            await core.createUser(name, pass);

            // Returns null
            return null;
        })
    )
    .post(
        "/rename",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string(),
            rename: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { name, pass, rename } = context.req.valid("json");
            
            // Renames user
            if(!await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            core.renameUser(name, rename);

            // Returns null
            return null;
        })
    )
    .post(
        "/repass",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string(),
            repass: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { name, pass, repass } = context.req.valid("json");
            
            // Repasses user
            if(!await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            await core.repassUser(name, repass);

            // Returns null
            return null;
        })
    )
    .delete(
        "/delete",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { name, pass } = context.req.valid("json");
            
            // Deletes user
            if(!await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            core.deleteUser(name);
            
            // Returns null
            return null;
        })
    )
    .put(
        "/unique",
        enforce(zod.object({
            name: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { name } = context.req.valid("json");
            
            // Fetches UUID
            const uuid = core.uniqueUser(name);
            
            // Returns UUID
            return uuid;
        })
    )
    .put(
        "/lookup",
        enforce(zod.object({
            uuid: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { uuid } = context.req.valid("json");
            
            // Fetches name
            const name = core.lookupUser(uuid);
            
            // Returns name
            return name;
        })
    )
    .put(
        "/obtain",
        enforce(zod.object({
            size: zod.int(),
            page: zod.int()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { size, page } = context.req.valid("json");
            
            // Fetches UUIDs
            const uuids = core.obtainUsers(size, page);
            
            // Returns UUIDs
            return uuids;
        })
    )
    .put(
        "/reveal",
        enforce(zod.object({
            size: zod.int(),
            page: zod.int()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { size, page } = context.req.valid("json");
            
            // Fetches names
            const names = core.revealUsers(size, page);
            
            // Returns names
            return names;
        })
    )

    // Defines token methods
    .post(
        "/generate",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { name, pass } = context.req.valid("json");
            
            // Generates token
            if(!await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            core.generateToken(name, pass);
            
            // Returns null
            return null;
        })
    )
    .put(
        "/retrieve",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { name, pass } = context.req.valid("json");
            
            // Retrieves token
            if(!await core.verifyUser(name, pass)) throw status.Code.USER_PASS_BLOCKED;
            const code = core.generateToken(name, pass);
            
            // Returns null
            return code;
        })
    )
    .put(
        "/identify",
        enforce(zod.object({
            code: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { code } = context.req.valid("json");

            // Identifies token
            const name = core.identifyToken(code);

            // Returns name
            return name;
        })
    )

    // Defines privilege methods
    .post(
        "/allow",
        enforce(zod.object({
            auth: zod.string(),
            code: zod.string(),
            pkey: zod.string(),
            pval: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { auth, code, pkey, pval } = context.req.valid("json");

            // Allows privilege
            if(core.checkPrivilege(auth, "manage-privileges") !== "1") throw status.Code.TOKEN_CODE_BLOCKED;
            core.allowPrivilege(code, pkey, pval);

            // Returns null
            return null;
        })
    )
    .post(
        "/deny",
        enforce(zod.object({
            auth: zod.string(),
            code: zod.string(),
            pkey: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { auth, code, pkey } = context.req.valid("json");

            // Allows privilege
            if(core.checkPrivilege(auth, "manage-privileges") !== "1") throw status.Code.TOKEN_CODE_BLOCKED;
            core.denyPrivilege(code, pkey);

            // Returns null
            return null;
        })
    )
    .put(
        "/check",
        enforce(zod.object({
            code: zod.string(),
            pkey: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { code, pkey } = context.req.valid("json");

            // Checks privilege
            const pval = core.checkPrivilege(code, pkey);

            // Returns pval
            return pval;
        })
    )
    .put(
        "/list",
        enforce(zod.object({
            code: zod.string()
        })),
        (context) => protect(context, async () => {
            // Parses body
            const { code } = context.req.valid("json");
            
            // List privileges
            const pairs = core.listPrivileges(code);
            
            // Returns pairs
            return pairs;
        })
    )
    
    // Defines fallback method
    .all(
        "/*",
        (context) => protect(context, async () => {
            throw status.Code.METHOD_NOT_FOUND;
        })
    );

// Exports
export default app;
