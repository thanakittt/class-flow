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
import { SignUpForm } from "@/modules/auth/components/SignUpForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "สมัครสมาชิก | Class Flow",
  description: "สมัครสมาชิกเพื่อดูรายวิชาใน Class Flow",
}

export default async function SignUpPage() {
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
            <CardTitle className="text-2xl">สมัครสมาชิก</CardTitle>
            <CardDescription>
              สร้างบัญชีเพื่อเข้าสู่หน้าดูและค้นหารายวิชา
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </main>
  )
}
