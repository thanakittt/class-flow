import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 bg-background">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-8 px-4 py-16 md:px-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <BookOpenIcon aria-hidden="true" />
        </div>
        <div className="flex max-w-2xl flex-col gap-4">
          <p className="text-sm font-medium text-muted-foreground">Class Flow</p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            จัดการรายวิชาและตารางเรียนในที่เดียว
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            เพิ่ม แก้ไข ค้นหา และดูข้อมูลรายวิชา ผู้สอน วันเวลาเรียน และสถานที่เรียนได้อย่างเป็นระบบ
          </p>
        </div>
        <Button asChild className="w-fit">
          <Link href="/courses">
            เข้าสู่หน้าจัดการรายวิชา
            <ArrowRightIcon data-icon="inline-end" />
          </Link>
        </Button>
      </main>
    </div>
  );
}
