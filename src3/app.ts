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
    // Wraps execution
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
            // Creates user
            const { name, pass } = context.req.valid("json");
            const code = await core.createUser(name, pass);
            return code;
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
            // Renames user
            const { name, pass, rename } = context.req.valid("json");
            const code = core.renameUser(name, pass, rename);
            return code;
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
            // Repasses user
            const { name, pass, repass } = context.req.valid("json");
            const code = await core.repassUser(name, pass, repass);
            return code;
        })
    )
    .delete(
        "/delete",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string()
        })),
        (context) => protect(context, async () => {
            // Deletes user
            const { name, pass } = context.req.valid("json");
            await core.deleteUser(name, pass);
            return null;
        })
    )
    .put(
        "/unique",
        enforce(zod.object({
            name: zod.string()
        })),
        (context) => protect(context, () => {
            // Fetches UUID
            const { name } = context.req.valid("json");
            const uuid = core.uniqueUser(name);
            return uuid;
        })
    )
    .put(
        "/lookup",
        enforce(zod.object({
            uuid: zod.string()
        })),
        (context) => protect(context, () => {
            // Fetches name
            const { uuid } = context.req.valid("json");
            const name = core.lookupUser(uuid);
            return name;
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
            // Generates token
            const { name, pass } = context.req.valid("json");
            const code = await core.generateToken(name, pass);
            return code;
        })
    )
    .put(
        "/generate",
        enforce(zod.object({
            name: zod.string(),
            pass: zod.string()
        })),
        (context) => protect(context, async () => {
            // Retrieves token
            const { name, pass } = context.req.valid("json");
            const code = await core.generateToken(name, pass);
            return code;
        })
    )
    .put(
        "/identify",
        enforce(zod.object({
            code: zod.string()
        })),
        (context) => protect(context, () => {
            // Identifies token
            const { code } = context.req.valid("json");
            const name = core.identifyToken(code);
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
        (context) => protect(context, () => {
            // Allows privilege
            const { auth, code, pkey, pval } = context.req.valid("json");
            core.allowPrivilege(code, pkey, pval, auth);
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
        (context) => protect(context, () => {
            // Denies privilege
            const { auth, code, pkey } = context.req.valid("json");
            core.denyPrivilege(code, pkey, auth);
            return null;
        })
    )
    .put(
        "/check",
        enforce(zod.object({
            code: zod.string(),
            pkey: zod.string()
        })),
        (context) => protect(context, () => {
            // Checks privilege
            const { code, pkey } = context.req.valid("json");
            const pval = core.checkPrivilege(code, pkey);
            return pval;
        })
    )
    .put(
        "/list",
        enforce(zod.object({
            code: zod.string()
        })),
        (context) => protect(context, () => {
            // List privileges
            const { code } = context.req.valid("json");
            const pairs = core.listPrivileges(code);
            return pairs;
        })
    );

// Exports
export default app;
