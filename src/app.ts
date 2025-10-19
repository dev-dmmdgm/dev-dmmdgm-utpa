// Imports
import { Hono } from "hono";
import { validator } from "hono/validator";
import * as zod from "zod";
import * as core from "./core";
import { H, MiddlewareHandlerInterface } from "hono/types";

// Creates codes
export enum Code {
    ACTION_SUCCESS,
    MALFORMED_BODY,
    PROCESS_EXCEPT,
    INTERNAL_ERROR
}

// @ts-ignore
function enforceStructure(): MiddlewareHandlerInterfac;
// @ts-ignore
function resolveProcess(): H;

// Creates server
const app = new Hono()
    .post("/create", validator("json", (value, context) => {
        // Parses value
        const result = zod.object({
            name: zod.string(),
            pass: zod.string()
        }).safeParse(value);

        // Transfers data
        if(!result.success) return context.json({
            "code": Code.MALFORMED_BODY,
            "except": null,
            "success": false
        });
        return result.data;
    }), (context) => {
        // Validates body
        const { name, pass } = context.req.valid("json");

        // Creates user
        try {
            // Initializes user
            core.createUser(name, pass);
            core.generateToken(name, pass);
            return context.json({
                "code": Code.ACTION_SUCCESS,
                "except": null,
                "success": true
            });
        }
        catch(error) {
            // Handles except
            if(
                typeof error === "number" &&
                error in core.Except
            ) return context.json({
                "code": Code.PROCESS_EXCEPT,
                "except": error,
                "success": false
            });

            // Handles error
            return context.json({
                "code": Code.INTERNAL_ERROR,
                "except": null,
                "success": false
            });
        }
    })
    .post("/rename", enforceStructure(), resolveProcess())
    .post("/repass")
    .delete("/delete")
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
