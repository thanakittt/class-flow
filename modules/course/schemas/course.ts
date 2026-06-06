import { z } from "zod/v4"

export const COURSE_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const

export type CourseDay = (typeof COURSE_DAYS)[number]

export type Course = {
  code: string
  englishName: string
  thaiName: string
  instructor: string
  day: CourseDay
  startTime: string
  endTime: string
  location: string
  section: number
}

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm format.")

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

export const courseSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Course code is required.")
      .max(32, "Course code must be 32 characters or less."),
    englishName: z
      .string()
      .trim()
      .min(1, "English name is required.")
      .max(160, "English name must be 160 characters or less."),
    thaiName: z
      .string()
      .trim()
      .min(1, "Thai name is required.")
      .max(160, "Thai name must be 160 characters or less."),
    instructor: z
      .string()
      .trim()
      .min(1, "Instructor is required.")
      .max(120, "Instructor must be 120 characters or less."),
    day: z.enum(COURSE_DAYS, "Select a course day."),
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .min(1, "Location is required.")
      .max(120, "Location must be 120 characters or less."),
    section: z.coerce
      .number<number>()
      .int("Section must be a whole number.")
      .positive("Section must be greater than 0."),
  })
  .superRefine((value, ctx) => {
    if (timeToMinutes(value.endTime) <= timeToMinutes(value.startTime)) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time.",
      })
    }
  })

export type CourseFormValues = z.infer<typeof courseSchema>

export type CourseActionFieldErrors = Partial<
  Record<keyof CourseFormValues | "root", string[]>
>

export type CourseActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string; fieldErrors?: CourseActionFieldErrors }

export const emptyCourseFormValues: CourseFormValues = {
  code: "",
  englishName: "",
  thaiName: "",
  instructor: "",
  day: "MON",
  startTime: "09:00",
  endTime: "10:00",
  location: "",
  section: 1,
}

export function courseToFormValues(course: Course): CourseFormValues {
  return {
    code: course.code,
    englishName: course.englishName,
    thaiName: course.thaiName,
    instructor: course.instructor,
    day: course.day,
    startTime: course.startTime,
    endTime: course.endTime,
    location: course.location,
    section: course.section,
  }
}
