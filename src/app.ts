// Imports
import { Hono } from "hono";
import { validator } from "hono/validator";
import * as zod from "zod";

// Creates server
const app = new Hono()
    // Creates user
    .post(
        "/create",
        validator("json", (value, context) => {
            // Parses json
            const schema = zod.object({
                name: zod.string(),
                pass: zod.string()
            });
            const result = schema.safeParse(value);
            if(!result.success) return context.text("Invalid JSON data.", 401);
            return result.data;
        }),
        (context) => {
            // Checks user
            const account: object = context.req.valid("json");
            console.log(account);
            return context.json({ "yuh": "lmao" });
        }
    )
    .put("/update")
    .delete("/delete")
    .post("/verify")
    .post("/refresh")
    .put("/allow")
    .post("/check")
    .put("/deny")
    .post("/inspect")
    .post("/discover")

export default app;
