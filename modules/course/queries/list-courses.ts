import "server-only"

import { sql } from "@/lib/db"
import { COURSE_DAYS, type Course, type CourseDay } from "@/modules/course/schemas/course"

export type CourseDayFilter = CourseDay | "today"

export type CourseListFilters = {
  query?: string
  day?: string
}

type CourseRow = {
  code: string
  english_name: string
  thai_name: string
  instructor: string
  day: CourseDay
  start_time: string
  end_time: string
  location: string
  section: number
}

const BANGKOK_WEEKDAY_TO_COURSE_DAY: Record<string, CourseDay> = {
  Friday: "FRI",
  Monday: "MON",
  Saturday: "SAT",
  Sunday: "SUN",
  Thursday: "THU",
  Tuesday: "TUE",
  Wednesday: "WED",
}

export function getTodayCourseDay(date = new Date()): CourseDay {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Bangkok",
    weekday: "long",
  }).format(date)

  return BANGKOK_WEEKDAY_TO_COURSE_DAY[weekday]
}

export function normalizeCourseDayFilter(value: string | undefined): CourseDayFilter | undefined {
  if (!value) {
    return undefined
  }

  if (value === "today") {
    return value
  }

  return COURSE_DAYS.includes(value as CourseDay) ? (value as CourseDay) : undefined
}

export function resolveCourseDayFilter(value: CourseDayFilter | undefined): CourseDay | undefined {
  return value === "today" ? getTodayCourseDay() : value
}

export function normalizeCourseDay(value: string | undefined): CourseDay | undefined {
  const day = normalizeCourseDayFilter(value)

  return day === "today" ? getTodayCourseDay() : day
}

export async function listCourses(filters: CourseListFilters = {}): Promise<Course[]> {
  const query = filters.query?.trim() ?? ""
  const day = normalizeCourseDay(filters.day)
  const search = `%${query}%`

  const rows = (await sql`
    SELECT
      code,
      english_name,
      thai_name,
      instructor,
      day,
      to_char(start_time, 'HH24:MI') as start_time,
      to_char(end_time, 'HH24:MI') as end_time,
      location,
      section
    FROM courses
    WHERE
      (${query} = '' OR
        code ILIKE ${search} OR
        english_name ILIKE ${search} OR
        thai_name ILIKE ${search} OR
        instructor ILIKE ${search} OR
        location ILIKE ${search}
      )
      AND (${day ?? ""} = '' OR day::text = ${day ?? ""})
    ORDER BY day, start_time, code, section
  `) as CourseRow[]

  return rows.map((row) => ({
    code: row.code,
    englishName: row.english_name,
    thaiName: row.thai_name,
    instructor: row.instructor,
    day: row.day,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    section: row.section,
  }))
}
