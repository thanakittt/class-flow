"use client"

import { useActionState } from "react"
import { LogInIcon } from "lucide-react"
import Link from "next/link"

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
  signInAction,
  type AuthActionState,
} from "@/modules/auth/actions/auth-actions"

const initialState: AuthActionState = {}

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState)

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <FieldGroup>
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
          <FieldError>
            {state.fieldErrors?.email?.[0]}
          </FieldError>
        </Field>
        <Field data-invalid={!!state.fieldErrors?.password}>
          <FieldLabel htmlFor="password">รหัสผ่าน</FieldLabel>
          <Input
            aria-invalid={!!state.fieldErrors?.password}
            autoComplete="current-password"
            disabled={isPending}
            id="password"
            name="password"
            placeholder="••••••••"
            type="password"
          />
          <FieldError>
            {state.fieldErrors?.password?.[0]}
          </FieldError>
        </Field>
      </FieldGroup>

      {state.message && (
        <p className="text-sm text-destructive" role="alert">
          {state.fieldErrors?.root?.[0] ?? state.message}
        </p>
      )}

      <Button disabled={isPending} size="lg" type="submit">
        {isPending ? <Spinner data-icon="inline-start" /> : <LogInIcon data-icon="inline-start" />}
        เข้าสู่ระบบ
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        ยังไม่มีบัญชี?{" "}
        <Button asChild variant="link">
          <Link href="/auth/sign-up">สมัครสมาชิก</Link>
        </Button>
      </p>
    </form>
  )
}
