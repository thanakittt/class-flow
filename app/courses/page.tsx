import { CourseManagement } from "@/modules/course/components/CourseManagement"
import {
  listCourses,
  normalizeCourseDayFilter,
  resolveCourseDayFilter,
} from "@/modules/course/queries/list-courses"

export const dynamic = "force-dynamic"

type CoursesPageProps = {
  searchParams: Promise<{
    day?: string | string[]
    q?: string | string[]
    view?: string | string[]
  }>
}

export type CourseView = "table" | "card"

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function resolveCourseView(value: string | undefined): CourseView {
  return value === "card" ? "card" : "table"
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams
  const query = getSingleParam(params.q)?.trim() ?? ""
  const dayFilter = normalizeCourseDayFilter(getSingleParam(params.day))
  const day = resolveCourseDayFilter(dayFilter)
  const view = resolveCourseView(getSingleParam(params.view))
  const courses = await listCourses({ day, query })

  return <CourseManagement courses={courses} filters={{ day: dayFilter ?? "", query }} view={view} />
}
