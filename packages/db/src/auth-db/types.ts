import { achievement, achievementType, attendance, beltPromotionRule, classe, gym, membership, membershipPlan, payment, profile, subscription, studentMembership } from "./schema";

export type GymRow = typeof gym.$inferSelect;
export type MembershipRow = typeof membership.$inferSelect;
export type ProfileRow = typeof profile.$inferSelect;
export type ClassRow = typeof classe.$inferSelect;
export type AttendanceRow = typeof attendance.$inferSelect;
export type AchievementRow = typeof achievement.$inferSelect;
export type AchievementTypeRow = typeof achievementType.$inferSelect;
export type MembershipPlanRow = typeof membershipPlan.$inferSelect;
export type PaymentRow = typeof payment.$inferSelect;
export type BeltPromotionRuleRow = typeof beltPromotionRule.$inferSelect;
export type SubscriptionRow = typeof subscription.$inferSelect;
export type StudentMembershipRow = typeof studentMembership.$inferSelect;

export type ProfileWithMemberships = {
    profile: ProfileRow;
    memberships: Array<
        MembershipRow & {
            gym: GymRow | null;
        }
    >;
};

export type GymWithStudents = {
    gym: GymRow;
    students: Array<{
        profile: ProfileRow;
        membership: MembershipRow & {
            studentMembership?: StudentMembershipRow & {
                membershipPlan?: MembershipPlanRow | null;
            };
        };
    }>;
};

export type ClassWithAttendances = {
    class: ClassRow;
    attendances: AttendanceRow[];
};

export type GymStudents = {
    membership: MembershipRow;
    profile: ProfileRow;
}

export type LeaderboardRow = {
    userId: string;
    name: string | null;
    avatarUrl: string | null;
    attendancesCount: number;
};

export type Class = Pick<ClassRow, "id" | "title" | "date" | "status" | "startAt" | "endAt" | "qrToken" | "modality" | "coachName" | "capacity">;

export type AchievementStats = {
    totalClasses: number;
    currentStreak: number;
};
