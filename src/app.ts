// Imports
import { Context, Hono } from "hono";
import { validator } from "hono/validator";
import * as zod from "zod";
import * as core from "./core";

// Defines statuses
export enum StatusCode {
    ACTION_SUCCESS,
    INTERNAL_ERROR,
    MALFORMED_BODY,
    RAISED_EXCEPT
}
export const statusTexts: { [ statusCode in StatusCode ]: string; } = {
    [ StatusCode.ACTION_SUCCESS ]: "Action was successful.",
    [ StatusCode.INTERNAL_ERROR ]: "An internal error had occurred.",
    [ StatusCode.MALFORMED_BODY ]: "Failed to parse incoming JSON: %reason%",
    [ StatusCode.RAISED_EXCEPT ]: "An exception was raised."
};
export const statusTypes: { [ statusCode in StatusCode ]: string; } = {
    [ StatusCode.ACTION_SUCCESS ]: "ACTION_SUCCESS",
    [ StatusCode.INTERNAL_ERROR ]: "INTERNAL_ERROR",
    [ StatusCode.MALFORMED_BODY ]: "MALFORMED_BODY",
    [ StatusCode.RAISED_EXCEPT ]: "RAISED_EXCEPT"
};

// Defines enforcer
export function enforce<SchemaType extends zod.ZodType>(schema: SchemaType) {
    // Validates schema
    const validate = validator("json", (value, context) => {
        // Parses value
        const result = schema.safeParse(value);
        if(!result.success) return context.json({
            "status": {
                "code": StatusCode.MALFORMED_BODY,
                "text": statusTexts[StatusCode.MALFORMED_BODY]
                    .replaceAll(/%reason%/g, result.error.message),
                "type": statusTypes[StatusCode.MALFORMED_BODY]
            }
        }, 400);
        return result.data;
    });
    return validate;
}

// Defines protector
export async function protect(context: Context, execute: () => unknown) {
    // Protects execution
    try {
        // Attempts execution
        const data = await execute();
        const statusCode = StatusCode.ACTION_SUCCESS;
        const statusText = statusTexts[statusCode];
        const statusType = statusTypes[statusCode];
        return context.json({
            "status": {
                "code": statusCode,
                "text": statusText,
                "type": statusType
            },
            "data": data
        }, 200);
    }
    catch(error) {
        // Reports error
        if(typeof error !== "number") {
            const statusCode = StatusCode.INTERNAL_ERROR;
            const statusText = statusTexts[statusCode];
            const statusType = statusTypes[statusCode];
            return context.json({
                "status": {
                    "code": statusCode,
                    "text": statusText,
                    "type": statusType
                }
            });
        }

        // Catches except
        const statusCode = StatusCode.RAISED_EXCEPT;
        const statusText = statusTexts[statusCode];
        const statusType = statusTypes[statusCode];
        const exceptCode = error in core.ExceptCode ?
            error as core.ExceptCode : core.ExceptCode.EXCEPT_UNKNOWN;
        const exceptText = core.exceptTexts[exceptCode];
        const exceptType = core.exceptTypes[exceptCode];
        return context.json({
            "status": {
                "code": statusCode,
                "text": statusText,
                "type": statusType
            },
            "except": {
                "code": exceptCode,
                "text": exceptText,
                "type": exceptType
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
