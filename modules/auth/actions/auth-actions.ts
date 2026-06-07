"use server"

import { redirect } from "next/navigation"
import { z } from "zod/v4"

import { auth, getCurrentUser } from "@/lib/auth/server"

const signInSchema = z.object({
  email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
})

const signUpSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ"),
  email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"),
})

export type AuthActionState = {
  fieldErrors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    root?: string[]
  }
  message?: string
}

export async function signInAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      message: "กรุณาตรวจสอบอีเมลและรหัสผ่าน",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { error } = await auth.signIn.email(parsed.data)

  if (error) {
    return {
      message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      fieldErrors: {
        root: ["อีเมลหรือรหัสผ่านไม่ถูกต้อง"],
      },
    }
  }

  redirect("/courses")
}

export async function signUpAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      message: "กรุณาตรวจสอบข้อมูลสมัครสมาชิก",
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const { error } = await auth.signUp.email(parsed.data)

  if (error) {
    return {
      message: "ไม่สามารถสมัครสมาชิกได้",
      fieldErrors: {
        root: [error.message || "ไม่สามารถสมัครสมาชิกได้"],
      },
    }
  }

  const user = await getCurrentUser()

  if (!user) {
    const { error: signInError } = await auth.signIn.email({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (signInError) {
      redirect("/auth/sign-in")
    }
  }

  redirect("/courses")
}

export async function signOutAction() {
  await auth.signOut()
  redirect("/auth/sign-in")
}
