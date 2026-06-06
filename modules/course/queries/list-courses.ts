import "server-only"

import { sql } from "@/lib/db"
import { COURSE_DAYS, type Course, type CourseDay } from "@/modules/course/schemas/course"

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

export function normalizeCourseDay(value: string | undefined): CourseDay | undefined {
  if (!value) {
    return undefined
  }

  return COURSE_DAYS.includes(value as CourseDay) ? (value as CourseDay) : undefined
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
