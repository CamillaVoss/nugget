import { z } from "zod";
import { sql } from "squid/pg";

const routeSchema = z.object({
    id: z.coerce.number().int().gte(0)
});

export default defineEventHandler(async (event) => {
    const params = await getValidatedRouterParams(event, routeSchema.parse);
    
    const recipes = await pool.query(sql`
        SELECT * FROM "recipes"
        WHERE "id" = ${params.id}
    `);
    
    if (recipes.rowCount == 0) {
        setResponseStatus(event, 404);
        return {
            recipe: null
        };
    }
    
    const recipe = recipes.rows[0];
    const steps = await pool.query(sql`
        SELECT "id", "text"
        FROM "recipe_steps"
        WHERE "recipe" = ${params.id}
        ORDER BY "order"
    `);
    recipe.steps = steps.rows;
    
    return { recipe };
});
