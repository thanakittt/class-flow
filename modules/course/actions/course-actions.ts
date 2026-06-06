"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"

import { sql } from "@/lib/db"
import {
  courseSchema,
  type CourseActionFieldErrors,
  type CourseActionResult,
  type CourseFormValues,
} from "@/modules/course/schemas/course"

function toFieldErrors(error: z.ZodError<CourseFormValues>): CourseActionFieldErrors {
  return error.flatten().fieldErrors as CourseActionFieldErrors
}

function getDatabaseMessage(error: unknown): CourseActionResult {
  const message = error instanceof Error ? error.message : ""

  if (message.includes("duplicate key") || message.includes("courses_pkey")) {
    return {
      ok: false,
      message: "Course code already exists.",
      fieldErrors: { code: ["Course code already exists."] },
    }
  }

  if (message.includes("courses_end_time_after_start_time")) {
    return {
      ok: false,
      message: "End time must be after start time.",
      fieldErrors: { endTime: ["End time must be after start time."] },
    }
  }

  return {
    ok: false,
    message: "Something went wrong. Please try again.",
    fieldErrors: { root: ["Something went wrong. Please try again."] },
  }
}

export async function createCourseAction(values: CourseFormValues): Promise<CourseActionResult> {
  const parsed = courseSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the course details.",
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  const course = parsed.data

  try {
    await sql`
      INSERT INTO courses (
        code,
        english_name,
        thai_name,
        instructor,
        day,
        start_time,
        end_time,
        location,
        section
      )
      VALUES (
        ${course.code},
        ${course.englishName},
        ${course.thaiName},
        ${course.instructor},
        ${course.day},
        ${course.startTime},
        ${course.endTime},
        ${course.location},
        ${course.section}
      )
    `

    revalidatePath("/courses")
    return { ok: true, message: "Course created." }
  } catch (error) {
    return getDatabaseMessage(error)
  }
}

export async function updateCourseAction(
  code: string,
  values: CourseFormValues
): Promise<CourseActionResult> {
  const parsed = courseSchema.safeParse(values)

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please check the course details.",
      fieldErrors: toFieldErrors(parsed.error),
    }
  }

  if (parsed.data.code !== code) {
    return {
      ok: false,
      message: "Course code cannot be changed.",
      fieldErrors: { code: ["Course code cannot be changed."] },
    }
  }

  const course = parsed.data

  try {
    await sql`
      UPDATE courses
      SET
        english_name = ${course.englishName},
        thai_name = ${course.thaiName},
        instructor = ${course.instructor},
        day = ${course.day},
        start_time = ${course.startTime},
        end_time = ${course.endTime},
        location = ${course.location},
        section = ${course.section}
      WHERE code = ${code}
    `

    revalidatePath("/courses")
    return { ok: true, message: "Course updated." }
  } catch (error) {
    return getDatabaseMessage(error)
  }
}

export async function deleteCourseAction(code: string): Promise<CourseActionResult> {
  try {
    await sql`DELETE FROM courses WHERE code = ${code}`
    revalidatePath("/courses")
    return { ok: true, message: "Course deleted." }
  } catch {
    return {
      ok: false,
      message: "Unable to delete this course. Please try again.",
      fieldErrors: { root: ["Unable to delete this course. Please try again."] },
    }
  }
}
