import { CourseManagement } from "@/modules/course/components/CourseManagement"
import { listCourses, normalizeCourseDay } from "@/modules/course/queries/list-courses"

export const dynamic = "force-dynamic"

type CoursesPageProps = {
  searchParams: Promise<{
    day?: string
    q?: string
  }>
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams
  const query = params.q?.trim() ?? ""
  const day = normalizeCourseDay(params.day)
  const courses = await listCourses({ day, query })

  return <CourseManagement courses={courses} filters={{ day: day ?? "", query }} />
}
