import { and, asc, eq } from "drizzle-orm";
import { authDb } from "..";
import { beltPromotion, beltPromotionRule, profile } from "../schema";
import { BeltPromotionRuleRow, BeltPromotionRow } from "../types";

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
            .where(eq(beltPromotionRule.id, existing[0]!.id));
        return;
    }

    await authDb.insert(beltPromotionRule).values({
        gymId,
        belt,
        requiredClasses,
    });
}

export async function getBeltPromotionsByUserGym(
    gymId: string,
    userId: string,
): Promise<BeltPromotionRow[]> {
    return authDb
        .select()
        .from(beltPromotion)
        .where(and(eq(beltPromotion.gymId, gymId), eq(beltPromotion.userId, userId)))
        .orderBy(asc(beltPromotion.promotedAt));
}

export async function recordBeltPromotion({
    gymId,
    userId,
    promotedBy,
    previousBelt,
    newBelt,
    notes,
}: {
    gymId: string;
    userId: string;
    promotedBy: string;
    previousBelt: string | null;
    newBelt: string;
    notes?: string | null;
}): Promise<void> {
    await authDb.insert(beltPromotion).values({
        gymId,
        userId,
        promotedBy,
        previousBelt,
        newBelt,
        notes: notes ?? null,
    });

    await authDb
        .update(profile)
        .set({ belt: newBelt })
        .where(eq(profile.userId, userId));
}
