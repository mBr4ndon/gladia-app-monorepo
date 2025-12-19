import { getExpiredStudentMemberships, updateStudentMembershipStatus } from "@gladia-app/db/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    const expected = process.env.VERCEL_CRON_SECRET;

    if (!expected || authHeader?.trim() !== `Bearer ${expected}`) {
        return new NextResponse("Unauthorized", { status: 401 });
    }    

    const now = new Date();
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0,
    );

    const memberships = await getExpiredStudentMemberships(today);

    if (memberships.length === 0) {
        return NextResponse.json({ updated: 0 });
    }

    for (const m of memberships) {
        await updateStudentMembershipStatus(m);
    }

    return NextResponse.json({ updated: memberships.length }); 
}