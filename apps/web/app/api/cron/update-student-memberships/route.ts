import { getExpiredStudentMemberships, updateStudentMembershipStatus } from "@gladia-app/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const startMs = Date.now();
    console.info("[cron][update-student-memberships] start");

    const authHeader = req.headers.get("authorization");
    const expected = process.env.VERCEL_CRON_SECRET;

    if (!expected || authHeader?.trim() !== `Bearer ${expected}`) {
        console.warn("[cron][update-student-memberships] unauthorized request", {
            hasSecret: Boolean(expected),
            hasAuthHeader: Boolean(authHeader),
        });
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const now = new Date();
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0,
    );
    console.info("[cron][update-student-memberships] computed dates", {
        now: now.toISOString(),
        today: today.toISOString(),
    });

    const memberships = await getExpiredStudentMemberships(today);
    console.info("[cron][update-student-memberships] memberships fetched", {
        count: memberships.length,
    });

    if (memberships.length === 0) {
        console.info("[cron][update-student-memberships] no expired memberships", {
            durationMs: Date.now() - startMs,
        });
        return NextResponse.json({ updated: 0 });
    }

    for (const m of memberships) {
        console.info("[cron][update-student-memberships] updating membership", {
            id: m.id,
            nextBillingDate: m.nextBillingDate,
        });
        await updateStudentMembershipStatus(m);
    }

    console.info("[cron][update-student-memberships] completed", {
        updated: memberships.length,
        durationMs: Date.now() - startMs,
    });
    return NextResponse.json({ updated: memberships.length }); 
}
