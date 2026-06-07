"use client"

import { useState, useTransition } from "react"
import { BookOpenIcon, PlusIcon, Trash2Icon } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  createCourseAction,
  deleteCourseAction,
  updateCourseAction,
} from "@/modules/course/actions/course-actions"
import { CourseFilters } from "@/modules/course/components/CourseFilters"
import { CourseFormDialog } from "@/modules/course/components/CourseFormDialog"
import { CourseTable } from "@/modules/course/components/CourseTable"
import { ThemeToggle } from "@/modules/course/components/ThemeToggle"
import type { Course, CourseFormValues } from "@/modules/course/schemas/course"

type CourseManagementProps = {
  courses: Course[]
  filters: {
    day: string
    query: string
  }
}

export function CourseManagement({ courses, filters }: CourseManagementProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | undefined>()
  const [deletingCourse, setDeletingCourse] = useState<Course | undefined>()
  const [deleteError, setDeleteError] = useState<string | undefined>()
  const [isDeleting, startDeleteTransition] = useTransition()

  function deleteSelectedCourse() {
    if (!deletingCourse) {
      return
    }

    setDeleteError(undefined)
    startDeleteTransition(async () => {
      const result = await deleteCourseAction(deletingCourse.code)

      if (result.ok) {
        setDeletingCourse(undefined)
        return
      }

      setDeleteError(result.message)
    })
  }

  async function updateSelectedCourse(values: CourseFormValues) {
    if (!editingCourse) {
      return {
        ok: false as const,
        message: "กรุณาเลือกรายวิชาก่อนแก้ไข",
        fieldErrors: { root: ["กรุณาเลือกรายวิชาก่อนแก้ไข"] },
      }
    }

    return updateCourseAction(editingCourse.code, values)
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Class Flow</p>
          <h1 className="text-3xl font-semibold tracking-tight">รายวิชา</h1>
          <p className="max-w-2xl text-muted-foreground">
            เพิ่ม แก้ไข ค้นหา และดูแลตารางเรียนของรายวิชาในระบบ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button onClick={() => setCreateOpen(true)}>
            <PlusIcon data-icon="inline-start" />
            เพิ่มรายวิชา
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>รายการรายวิชา</CardTitle>
          <CardDescription>พบ {courses.length} รายวิชา</CardDescription>
          <CardAction className="hidden md:block">
            <BookOpenIcon className="text-muted-foreground" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <CourseFilters
            key={`${filters.query}:${filters.day}`}
            day={filters.day}
            query={filters.query}
          />
          {courses.length > 0 ? (
            <CourseTable
              courses={courses}
              onDelete={setDeletingCourse}
              onEdit={setEditingCourse}
            />
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpenIcon />
                </EmptyMedia>
                <EmptyTitle>ไม่พบรายวิชา</EmptyTitle>
                <EmptyDescription>
                  เพิ่มรายวิชาใหม่ หรือปรับเงื่อนไขการค้นหาปัจจุบัน
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={() => setCreateOpen(true)}>
                  <PlusIcon data-icon="inline-start" />
                  เพิ่มรายวิชา
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>

      <CourseFormDialog
        mode="create"
        onOpenChange={setCreateOpen}
        onSubmit={createCourseAction}
        open={createOpen}
      />
      <CourseFormDialog
        course={editingCourse}
        mode="edit"
        onOpenChange={(open) => {
          if (!open) {
            setEditingCourse(undefined)
          }
        }}
        onSubmit={updateSelectedCourse}
        open={!!editingCourse}
      />
      <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>ลบรายวิชานี้หรือไม่</AlertDialogTitle>
            <AlertDialogDescription>
              ระบบจะลบรายวิชา {deletingCourse?.code} อย่างถาวร และไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={(event) => {
                event.preventDefault()
                deleteSelectedCourse()
              }}
              variant="destructive"
            >
              {isDeleting ? <Spinner data-icon="inline-start" /> : <Trash2Icon data-icon="inline-start" />}
              ลบรายวิชา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
