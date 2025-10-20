// Imports
import { Context, Hono } from "hono";
import { validator } from "hono/validator";
import * as zod from "zod";
import * as core from "./core";

// Creates codes
export enum Code {
    ACTION_SUCCESS = 3000,
    MALFORMED_BODY,
    EXCEPT_ERROR,
    INTERNAL_ERROR,
    UNBOUNDED_ERROR
}

// Creates server
const app = new Hono()
    .post(
        "/create",
        validator("json", (value, context) => {
            // Parses value
            const result = zod.object({
                name: zod.string(),
                pass: zod.string()
            }).safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            });
            return result.data;
        }),
        (context) => {
            // Resolves request
            try {
                // Executes process
                const { name, pass } = context.req.valid("json");
                core.createUser(name, pass);
                core.generateToken(name, pass);
                return context.json({
                    "code": Code.ACTION_SUCCESS
                });
            }
            catch(error) {
                // Handles specified error
                if(typeof error === "number") {
                    // Handles except error
                    if(error in core.Except) return context.json({
                        "code": Code.EXCEPT_ERROR,
                        "except": error,
                    });

                    // Handles unbounded error
                    return context.json({
                        "code": Code.UNBOUNDED_ERROR,
                        "cause": error
                    });
                }
                
                // Handles internal error
                return context.json({
                    "code": Code.INTERNAL_ERROR
                });
            }
        }
    )
    .post(
        "/rename",
        validator("json", (value, context) => {
            // Parses value
            const result = zod.object({
                name: zod.string(),
                pass: zod.string(),
                rename: zod.string()
            }).safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            });
            return result.data;
        }),
        (context) => {
            // Resolves request
            try {
                // Executes process
                const { name, pass, rename } = context.req.valid("json");
                core.renameUser(name, pass, rename);
                return context.json({
                    "code": Code.ACTION_SUCCESS
                });
            }
            catch(error) {
                // Handles specified error
                if(typeof error === "number") {
                    // Handles except error
                    if(error in core.Except) return context.json({
                        "code": Code.EXCEPT_ERROR,
                        "except": error,
                    });

                    // Handles unbounded error
                    return context.json({
                        "code": Code.UNBOUNDED_ERROR,
                        "cause": error
                    });
                }
                
                // Handles internal error
                return context.json({
                    "code": Code.INTERNAL_ERROR
                });
            }
        }
    )
    .post(
        "/repass",
        validator("json", (value, context) => {
            // Parses value
            const result = zod.object({
                name: zod.string(),
                pass: zod.string(),
                repass: zod.string()
            }).safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            });
            return result.data;
        }),
        (context) => {
            // Resolves request
            try {
                // Executes process
                const { name, pass, repass } = context.req.valid("json");
                core.repassUser(name, pass, repass);
                core.generateToken(name, pass);
                return context.json({
                    "code": Code.ACTION_SUCCESS
                });
            }
            catch(error) {
                // Handles specified error
                if(typeof error === "number") {
                    // Handles except error
                    if(error in core.Except) return context.json({
                        "code": Code.EXCEPT_ERROR,
                        "except": error,
                    });

                    // Handles unbounded error
                    return context.json({
                        "code": Code.UNBOUNDED_ERROR,
                        "cause": error
                    });
                }
                
                // Handles internal error
                return context.json({
                    "code": Code.INTERNAL_ERROR
                });
            }
        }
    )
    .delete(
        "/delete",
        validator("json", (value, context) => {
            // Parses value
            const result = zod.object({
                name: zod.string(),
                pass: zod.string()
            }).safeParse(value);
            if(!result.success) return context.json({
                "code": Code.MALFORMED_BODY
            });
            return result.data;
        }),
        (context) => {
            // Resolves request
            try {
                // Executes process
                const { name, pass } = context.req.valid("json");
                core.deleteUser(name, pass);
                return context.json({
                    "code": Code.ACTION_SUCCESS
                });
            }
            catch(error) {
                // Handles specified error
                if(typeof error === "number") {
                    // Handles except error
                    if(error in core.Except) return context.json({
                        "code": Code.EXCEPT_ERROR,
                        "except": error,
                    });

                    // Handles unbounded error
                    return context.json({
                        "code": Code.UNBOUNDED_ERROR,
                        "cause": error
                    });
                }
                
                // Handles internal error
                return context.json({
                    "code": Code.INTERNAL_ERROR
                });
            }
        }
    )
    .put("/unique")
    .put("/lookup")
    .post("/generate")
    .put("/retrieve")
    .put("/identify")
    .post("/allow")
    .post("/deny")
    .put("/check")
    .put("/list")

export default app;
