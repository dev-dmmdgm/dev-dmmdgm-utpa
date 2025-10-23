// Imports
import { Hono } from "hono";
import { validator } from "hono/validator";
import * as zod from "zod";
import * as core from "./core";

// Defines codes
export enum Code {
    ACTION_SUCCESS,
    MALFORMED_BODY,
    RAISED_EXCEPT
}

// Creates server
export const app = new Hono()
    .post(
        "/create",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                name: zod.string(),
                pass: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        async (context) => {
            // Creates user
            const { name, pass } = context.req.valid("json");
            try {
                const code = await core.createUser(name, pass);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": code
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .post(
        "/rename",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                name: zod.string(),
                pass: zod.string(),
                rename: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // Renames user
            const { name, pass, rename } = context.req.valid("json");
            try {
                const code = core.renameUser(name, pass, rename);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": code
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .post(
        "/repass",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                name: zod.string(),
                pass: zod.string(),
                repass: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        async (context) => {
            // Repasses user
            const { name, pass, repass } = context.req.valid("json");
            try {
                const code = await core.repassUser(name, pass, repass);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": code
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .delete(
        "/delete",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                name: zod.string(),
                pass: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        async (context) => {
            // Deletes user
            const { name, pass } = context.req.valid("json");
            try {
                await core.deleteUser(name, pass);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": null
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .put(
        "/unique",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                name: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // Finds user UUID
            const { name } = context.req.valid("json");
            try {
                const uuid = core.uniqueUser(name);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": uuid
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .put(
        "/lookup",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                uuid: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // Finds user name
            const { uuid } = context.req.valid("json");
            try {
                const name = core.lookupUser(uuid);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": name
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .post(
        "/generate",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                name: zod.string(),
                pass: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        async (context) => {
            // Generates token
            const { name, pass } = context.req.valid("json");
            try {
                const code = await core.generateToken(name, pass);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": code
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .put(
        "/retrieve",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                name: zod.string(),
                pass: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        async (context) => {
            // Retrieves token
            const { name, pass } = context.req.valid("json");
            try {
                const code = await core.retrieveToken(name, pass);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": code
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .put(
        "/identify",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                code: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // Identifies token
            const { code } = context.req.valid("json");
            try {
                const name = core.identifyToken(code);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": name
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .post(
        "/allow",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                auth: zod.string(),
                code: zod.string(),
                pkey: zod.string(),
                pval: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // Allows privilege
            const { auth, code, pkey, pval } = context.req.valid("json");
            try {
                core.allowPrivilege(code, pkey, pval, auth);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": null
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .post(
        "/deny",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                auth: zod.string(),
                code: zod.string(),
                pkey: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // Denies privilege
            const { auth, code, pkey } = context.req.valid("json");
            try {
                core.denyPrivilege(code, pkey, auth);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": null
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .put(
        "/check",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                code: zod.string(),
                pkey: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // Checks privilege
            const { code, pkey } = context.req.valid("json");
            try {
                const pval = core.checkPrivilege(code, pkey);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": pval
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    )
    .put(
        "/list",
        validator("json", (value, context) => {
            // Parses value
            const schema = zod.object({
                code: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            }, 400);
            return result.data;
        }),
        (context) => {
            // List privileges
            const { code } = context.req.valid("json");
            try {
                const pairs = core.listPrivileges(code);
                return context.json({
                    "code": Code.ACTION_SUCCESS,
                    "data": pairs
                }, 200);
            }
            catch(error) {
                return context.json({
                    "code": Code.RAISED_EXCEPT,
                    "except": error as number
                }, 400);
            }
        }
    );

// Exports
export default app;
