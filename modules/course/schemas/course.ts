import { z } from "zod/v4"

export const COURSE_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const

export type CourseDay = (typeof COURSE_DAYS)[number]

export const COURSE_DAY_LABELS: Record<CourseDay, string> = {
  MON: "วันจันทร์",
  TUE: "วันอังคาร",
  WED: "วันพุธ",
  THU: "วันพฤหัสบดี",
  FRI: "วันศุกร์",
  SAT: "วันเสาร์",
  SUN: "วันอาทิตย์",
}

export function getCourseDayLabel(day: CourseDay) {
  return COURSE_DAY_LABELS[day]
}

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
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "กรุณากรอกเวลาในรูปแบบ HH:mm")

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number)
  return hours * 60 + minutes
}

export const courseSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "กรุณากรอกรหัสรายวิชา")
      .max(32, "รหัสรายวิชาต้องไม่เกิน 32 ตัวอักษร"),
    englishName: z
      .string()
      .trim()
      .min(1, "กรุณากรอกชื่อรายวิชาภาษาอังกฤษ")
      .max(160, "ชื่อรายวิชาภาษาอังกฤษต้องไม่เกิน 160 ตัวอักษร"),
    thaiName: z
      .string()
      .trim()
      .min(1, "กรุณากรอกชื่อรายวิชาภาษาไทย")
      .max(160, "ชื่อรายวิชาภาษาไทยต้องไม่เกิน 160 ตัวอักษร"),
    instructor: z
      .string()
      .trim()
      .min(1, "กรุณากรอกชื่อผู้สอน")
      .max(120, "ชื่อผู้สอนต้องไม่เกิน 120 ตัวอักษร"),
    day: z.enum(COURSE_DAYS, "กรุณาเลือกวันเรียน"),
    startTime: timeSchema,
    endTime: timeSchema,
    location: z
      .string()
      .trim()
      .min(1, "กรุณากรอกสถานที่เรียน")
      .max(120, "สถานที่เรียนต้องไม่เกิน 120 ตัวอักษร"),
    section: z.coerce
      .number<number>()
      .int("หมู่เรียนต้องเป็นจำนวนเต็ม")
      .positive("หมู่เรียนต้องมากกว่า 0"),
  })
  .superRefine((value, ctx) => {
    if (timeToMinutes(value.endTime) <= timeToMinutes(value.startTime)) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
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
