"use client"

import { ClockIcon, EditIcon, MapPinIcon, Trash2Icon, UserIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  COURSE_DAYS,
  getCourseDayLabel,
  type Course,
  type CourseDay,
} from "@/modules/course/schemas/course"

type CourseCardViewProps = {
  canManageCourses: boolean
  courses: Course[]
  onDelete: (course: Course) => void
  onEdit: (course: Course) => void
}

function groupCoursesByDay(courses: Course[]) {
  const groups = new Map<CourseDay, Course[]>()

  for (const day of COURSE_DAYS) {
    groups.set(day, [])
  }

  for (const course of courses) {
    groups.get(course.day)?.push(course)
  }

  return COURSE_DAYS.map((day) => ({
    courses: groups.get(day) ?? [],
    day,
  })).filter((group) => group.courses.length > 0)
}

export function CourseCardView({
  canManageCourses,
  courses,
  onDelete,
  onEdit,
}: CourseCardViewProps) {
  const groupedCourses = groupCoursesByDay(courses)

  return (
    <div className="flex flex-col gap-6">
      {groupedCourses.map((group) => (
        <section className="flex flex-col gap-3" key={group.day}>
          <div className="flex items-center gap-3">
            <Badge variant="secondary">{getCourseDayLabel(group.day)}</Badge>
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground">{group.courses.length} รายวิชา</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {group.courses.map((course) => (
              <article
                className="flex min-h-56 flex-col justify-between gap-4 rounded-3xl border bg-background p-4 shadow-sm"
                key={`${course.code}-${course.section}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <ClockIcon aria-hidden="true" />
                        <span>
                          {course.startTime}-{course.endTime}
                        </span>
                      </div>
                      <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
                        <MapPinIcon aria-hidden="true" />
                        <span className="truncate">{course.location}</span>
                      </div>
                    </div>
                    <Badge variant="outline">หมู่ {course.section}</Badge>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Badge>{course.code}</Badge>
                      <span className="text-sm text-muted-foreground">{getCourseDayLabel(course.day)}</span>
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="line-clamp-2 font-medium">{course.englishName}</h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{course.thaiName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon aria-hidden="true" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                  {canManageCourses && (
                    <div className="flex shrink-0 gap-2">
                      <Button size="icon-sm" type="button" variant="ghost" onClick={() => onEdit(course)}>
                        <EditIcon />
                        <span className="sr-only">แก้ไขรายวิชา {course.code}</span>
                      </Button>
                      <Button
                        size="icon-sm"
                        type="button"
                        variant="destructive"
                        onClick={() => onDelete(course)}
                      >
                        <Trash2Icon />
                        <span className="sr-only">ลบรายวิชา {course.code}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
