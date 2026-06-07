"use client"

import { useActionState } from "react"
import Link from "next/link"
import { UserPlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  signUpAction,
  type AuthActionState,
} from "@/modules/auth/actions/auth-actions"

const initialState: AuthActionState = {}

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={!!state.fieldErrors?.name}>
          <FieldLabel htmlFor="name">ชื่อ</FieldLabel>
          <Input
            aria-invalid={!!state.fieldErrors?.name}
            autoComplete="name"
            disabled={isPending}
            id="name"
            name="name"
            placeholder="ชื่อของคุณ"
            type="text"
          />
          <FieldError>{state.fieldErrors?.name?.[0]}</FieldError>
        </Field>
        <Field data-invalid={!!state.fieldErrors?.email}>
          <FieldLabel htmlFor="email">อีเมล</FieldLabel>
          <Input
            aria-invalid={!!state.fieldErrors?.email}
            autoComplete="email"
            disabled={isPending}
            id="email"
            name="email"
            placeholder="name@example.com"
            type="email"
          />
          <FieldError>{state.fieldErrors?.email?.[0]}</FieldError>
        </Field>
        <Field data-invalid={!!state.fieldErrors?.password}>
          <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
          <Input
            aria-invalid={!!state.fieldErrors?.password}
            autoComplete="new-password"
            disabled={isPending}
            id="password"
            name="password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            type="password"
          />
          <FieldError>{state.fieldErrors?.password?.[0]}</FieldError>
        </Field>
      </FieldGroup>

      {state.message && (
        <p className="text-sm text-destructive" role="alert">
          {state.fieldErrors?.root?.[0] ?? state.message}
        </p>
      )}

      <Button disabled={isPending} size="lg" type="submit">
        {isPending ? <Spinner data-icon="inline-start" /> : <UserPlusIcon data-icon="inline-start" />}
        สมัครสมาชิก
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        มีบัญชีแล้ว?{" "}
        <Button asChild variant="link">
          <Link href="/auth/sign-in">เข้าสู่ระบบ</Link>
        </Button>
      </p>
    </form>
  )
}
