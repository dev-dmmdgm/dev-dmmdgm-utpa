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
export const statusText: { [ statusCode in StatusCode ]: string; } = {
    [ StatusCode.ACTION_SUCCESS ]: "Action was successful.",
    [ StatusCode.INTERNAL_ERROR ]: "An internal error had occurred.",
    [ StatusCode.MALFORMED_BODY ]: "Failed to parse incoming JSON: %reason%",
    [ StatusCode.RAISED_EXCEPT ]: "An exception was raised."
};
export const statusType: { [ statusCode in StatusCode ]: string; } = {
    [ StatusCode.ACTION_SUCCESS ]: "ACTION_SUCCESS",
    [ StatusCode.INTERNAL_ERROR ]: "INTERNAL_ERROR",
    [ StatusCode.MALFORMED_BODY ]: "MALFORMED_BODY",
    [ StatusCode.RAISED_EXCEPT ]: "RAISED_EXCEPT"
};

// Defines helpers
export function enforce<SchemaType extends zod.ZodType>(schema: SchemaType) {
    // Validates schema
    return validator("json", (value, context) => {
        // Parses value
        const result = schema.safeParse(value);
        if(!result.success) return context.json({
            "status": {
                "code": StatusCode.MALFORMED_BODY,
                "text": statusText[StatusCode.MALFORMED_BODY]
                    .replaceAll(/%reason%/g, result.error.message),
                "type": statusType[StatusCode.MALFORMED_BODY]
            }
        }, 400);
        return result.data;
    });
}
export async function execute(context: Context, callback: () => unknown) {
    // Resolves response
    try {
        const data = await callback();
        return context.json({
            "status": {
                "code": StatusCode.ACTION_SUCCESS,
                "text": statusText[StatusCode.ACTION_SUCCESS],
                "type": statusType[StatusCode.ACTION_SUCCESS]
            },
            "data": data
        }, 200);
    }
    catch(error) {
        if(typeof error !== "number") return context.json({
            "status": {
                "code": StatusCode.INTERNAL_ERROR,
                "text": statusText[StatusCode.INTERNAL_ERROR],
                "type": statusType[StatusCode.INTERNAL_ERROR]
            }
        });
        return context.json({
            "status": {
                "code": StatusCode.RAISED_EXCEPT,
                "text": statusText[StatusCode.RAISED_EXCEPT],
                "type": statusType[StatusCode.RAISED_EXCEPT]
            },
            "except": {
                "code": error as core.ExceptCode,
                "text": core.exceptText[error as core.ExceptCode],
                "type": core.exceptType[error as core.ExceptCode]
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
        (context) => execute(context, async () => {
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
        (context) => execute(context, async () => {
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
        (context) => execute(context, async () => {
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
        (context) => execute(context, async () => {
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
        (context) => execute(context, () => {
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
        (context) => execute(context, () => {
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
        (context) => execute(context, async () => {
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
        (context) => execute(context, async () => {
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
        (context) => execute(context, () => {
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
        (context) => execute(context, () => {
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
        (context) => execute(context, () => {
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
        (context) => execute(context, () => {
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
        (context) => execute(context, () => {
            // List privileges
            const { code } = context.req.valid("json");
            const pairs = core.listPrivileges(code);
            return pairs;
        })
    );

// Exports
export default app;
