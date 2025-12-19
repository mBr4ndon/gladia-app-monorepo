import { startOfDay } from "../utils";
import { getAttendanceStatsForDay } from "./attendance";
import { getTodayClassesForGym } from "./classe";
import { getGymBySlug } from "./gym";

export async function getGymDashboardDataBySlug(
    slug: string,
    date: Date = new Date(),
) {
    const gymRow = await getGymBySlug(slug);

    if (!gymRow) return null;

    const day = startOfDay(date);

    const [classes, attendanceStats] = await Promise.all([
        getTodayClassesForGym(gymRow.id),
        getAttendanceStatsForDay({ gymId: gymRow.id, date: day }),
    ]);

    return {
        gym: {
            id: gymRow.id,
            name: gymRow.name,
            slug: gymRow.slug,
        },
        stats: {
            todaysClasses: classes.length,
            todaysAttendance: attendanceStats.totalAttendance,
        },
        todaysClasses: classes,
    };
}

