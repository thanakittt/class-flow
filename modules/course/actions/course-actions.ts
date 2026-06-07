"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

import { requireAdmin } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import {
  courseSchema,
  type CourseActionFieldErrors,
  type CourseActionResult,
  type CourseFormValues,
} from "@/modules/course/schemas/course";

const signInRequiredResult: CourseActionResult = {
  ok: false,
  message: "กรุณาเข้าสู่ระบบก่อนจัดการรายวิชา",
  fieldErrors: { root: ["กรุณาเข้าสู่ระบบก่อนจัดการรายวิชา"] },
};

const adminRequiredResult: CourseActionResult = {
  ok: false,
  message: "เฉพาะผู้ดูแลระบบเท่านั้นที่จัดการรายวิชาได้",
  fieldErrors: { root: ["เฉพาะผู้ดูแลระบบเท่านั้นที่จัดการรายวิชาได้"] },
};

const unexpectedErrorResult: CourseActionResult = {
  ok: false,
  message: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง",
  fieldErrors: { root: ["เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง"] },
};

async function ensureAdmin(): Promise<CourseActionResult | undefined> {
  try {
    await requireAdmin();
    return undefined;
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return signInRequiredResult;
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return adminRequiredResult;
    }

    throw error;
  }
}

function toFieldErrors(
  error: z.ZodError<CourseFormValues>,
): CourseActionFieldErrors {
  return error.flatten().fieldErrors as CourseActionFieldErrors;
}

function getDatabaseMessage(error: unknown): CourseActionResult {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("duplicate key") || message.includes("courses_pkey")) {
    return {
      ok: false,
      message: "มีรหัสรายวิชานี้อยู่แล้ว",
      fieldErrors: { code: ["มีรหัสรายวิชานี้อยู่แล้ว"] },
    };
  }

  if (message.includes("courses_end_time_after_start_time")) {
    return {
      ok: false,
      message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น",
      fieldErrors: { endTime: ["เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น"] },
    };
  }

  return {
    ok: false,
    message: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
    fieldErrors: { root: ["เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"] },
  };
}

export async function createCourseAction(
  values: CourseFormValues,
): Promise<CourseActionResult> {
  try {
    const unauthorized = await ensureAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const parsed = courseSchema.safeParse(values);

    if (!parsed.success) {
      return {
        ok: false,
        message: "กรุณาตรวจสอบข้อมูลรายวิชา",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const course = parsed.data;

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
      `;

      revalidatePath("/courses");
      return { ok: true, message: "สร้างรายวิชาแล้ว" };
    } catch (error) {
      return getDatabaseMessage(error);
    }
  } catch (error) {
    console.error("Failed to create course", error);
    return unexpectedErrorResult;
  }
}

export async function updateCourseAction(
  code: string,
  values: CourseFormValues,
): Promise<CourseActionResult> {
  try {
    const unauthorized = await ensureAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    const parsed = courseSchema.safeParse(values);

    if (!parsed.success) {
      return {
        ok: false,
        message: "กรุณาตรวจสอบข้อมูลรายวิชา",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    if (parsed.data.code !== code) {
      return {
        ok: false,
        message: "ไม่สามารถเปลี่ยนรหัสรายวิชาได้",
        fieldErrors: { code: ["ไม่สามารถเปลี่ยนรหัสรายวิชาได้"] },
      };
    }

    const course = parsed.data;

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
      `;

      revalidatePath("/courses");
      return { ok: true, message: "บันทึกการแก้ไขรายวิชาแล้ว" };
    } catch (error) {
      return getDatabaseMessage(error);
    }
  } catch (error) {
    console.error("Failed to update course", error);
    return unexpectedErrorResult;
  }
}

export async function deleteCourseAction(
  code: string,
): Promise<CourseActionResult> {
  try {
    const unauthorized = await ensureAdmin();

    if (unauthorized) {
      return unauthorized;
    }

    try {
      await sql`DELETE FROM courses WHERE code = ${code}`;
      revalidatePath("/courses");
      return { ok: true, message: "ลบรายวิชาแล้ว" };
    } catch {
      return {
        ok: false,
        message: "ไม่สามารถลบรายวิชานี้ได้ กรุณาลองใหม่อีกครั้ง",
        fieldErrors: {
          root: ["ไม่สามารถลบรายวิชานี้ได้ กรุณาลองใหม่อีกครั้ง"],
        },
      };
    }
  } catch (error) {
    console.error("Failed to delete course", error);
    return {
      ok: false,
      message: "ไม่สามารถลบรายวิชาได้ กรุณาลองใหม่อีกครั้ง",
      fieldErrors: { root: ["ไม่สามารถลบรายวิชาได้ กรุณาลองใหม่อีกครั้ง"] },
    };
  }
}
