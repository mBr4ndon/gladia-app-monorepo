import { and, eq } from "drizzle-orm";
import { authDb } from "..";
import { beltPromotionRule } from "../schema";
import { BeltPromotionRuleRow } from "../types";

export async function getBeltPromotionRulesByGym(
    gymId: string,
): Promise<BeltPromotionRuleRow[]> {
    return authDb
        .select()
        .from(beltPromotionRule)
        .where(eq(beltPromotionRule.gymId, gymId));
}

export async function upsertBeltPromotionRule(
    gymId: string,
    belt: string,
    requiredClasses: number,
): Promise<void> {
    if (requiredClasses === 0) {
        await authDb
            .delete(beltPromotionRule)
            .where(and(eq(beltPromotionRule.gymId, gymId), eq(beltPromotionRule.belt, belt)));
        return;
    }

    const existing = await authDb
        .select({ id: beltPromotionRule.id })
        .from(beltPromotionRule)
        .where(and(eq(beltPromotionRule.gymId, gymId), eq(beltPromotionRule.belt, belt)))
        .limit(1);

    if (existing.length > 0) {
        await authDb
            .update(beltPromotionRule)
            .set({ requiredClasses })
            .where(eq(beltPromotionRule.id, existing[0].id));
        return;
    }

    await authDb.insert(beltPromotionRule).values({
        gymId,
        belt,
        requiredClasses,
    });
}
