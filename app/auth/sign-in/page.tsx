import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { BookOpenIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth/server"
import { SignInForm } from "@/modules/auth/components/SignInForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | Class Flow",
  description: "เข้าสู่ระบบเพื่อดูและจัดการรายวิชาใน Class Flow",
}

export default async function SignInPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/courses")
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-background px-4 py-12 md:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-4">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <BookOpenIcon aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-2">
            <CardTitle className="text-2xl">เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              เข้าสู่ระบบเพื่อดูรายวิชาและจัดการข้อมูลตามสิทธิ์ของคุณ
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  )
}
