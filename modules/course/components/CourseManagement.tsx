"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpenIcon, LogOutIcon, PlusIcon, Trash2Icon } from "lucide-react";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createCourseAction,
  deleteCourseAction,
  updateCourseAction,
} from "@/modules/course/actions/course-actions";
import { CourseCardView } from "@/modules/course/components/CourseCardView";
import { CourseFilters } from "@/modules/course/components/CourseFilters";
import { CourseFormDialog } from "@/modules/course/components/CourseFormDialog";
import { CourseTable } from "@/modules/course/components/CourseTable";
import { ThemeToggle } from "@/modules/course/components/ThemeToggle";
import type { Course, CourseFormValues } from "@/modules/course/schemas/course";

type CourseView = "table" | "card";

type CourseManagementProps = {
  canManageCourses: boolean;
  courses: Course[];
  filters: {
    day: string;
    query: string;
  };
  view: CourseView;
};

const unexpectedDeleteMessage = "ไม่สามารถลบรายวิชาได้ กรุณาลองใหม่อีกครั้ง";

export function CourseManagement({
  canManageCourses,
  courses,
  filters,
  view,
}: CourseManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [deletingCourse, setDeletingCourse] = useState<Course | undefined>();
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isSigningOut, startSignOutTransition] = useTransition();

  function updateView(nextView: string) {
    const params = new URLSearchParams();

    if (filters.query) {
      params.set("q", filters.query);
    }

    if (filters.day) {
      params.set("day", filters.day);
    }

    if (nextView === "card") {
      params.set("view", nextView);
    }

    const search = params.toString();
    router.replace(search ? `${pathname}?${search}` : pathname);
  }

  function deleteSelectedCourse() {
    if (!deletingCourse) {
      return;
    }

    setDeleteError(undefined);
    startDeleteTransition(async () => {
      try {
        const result = await deleteCourseAction(deletingCourse.code);

        if (result.ok) {
          setDeletingCourse(undefined);
          return;
        }

        setDeleteError(result.message);
      } catch (error) {
        console.error("Failed to delete course", error);
        setDeleteError(unexpectedDeleteMessage);
      }
    });
  }

  function signOut() {
    startSignOutTransition(async () => {
      await fetch("/api/auth/sign-out", {
        body: "{}",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      router.replace("/auth/sign-in");
      router.refresh();
    });
  }

  async function updateSelectedCourse(values: CourseFormValues) {
    if (!editingCourse) {
      return {
        ok: false as const,
        message: "กรุณาเลือกรายวิชาก่อนแก้ไข",
        fieldErrors: { root: ["กรุณาเลือกรายวิชาก่อนแก้ไข"] },
      };
    }

    return updateCourseAction(editingCourse.code, values);
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Class Flow
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">รายวิชา</h1>
          <p className="max-w-2xl text-muted-foreground">
            เพิ่ม แก้ไข ค้นหา และดูแลตารางเรียนของรายวิชาในระบบ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            disabled={isSigningOut}
            onClick={signOut}
            size="icon"
            type="button"
            variant="outline"
          >
            {isSigningOut ? <Spinner /> : <LogOutIcon />}
            <span className="sr-only">ออกจากระบบ</span>
          </Button>
          {canManageCourses && (
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon data-icon="inline-start" />
              เพิ่มรายวิชา
            </Button>
          )}
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
        <CardContent>
          <Tabs className="gap-5" value={view} onValueChange={updateView}>
            <TabsList>
              <TabsTrigger value="table">ตาราง</TabsTrigger>
              <TabsTrigger value="card">การ์ด</TabsTrigger>
            </TabsList>
            <CourseFilters
              key={`${filters.query}:${filters.day}:${view}`}
              day={filters.day}
              query={filters.query}
              view={view}
            />
            {courses.length > 0 ? (
              <>
                <TabsContent value="table">
                  <CourseTable
                    canManageCourses={canManageCourses}
                    courses={courses}
                    onDelete={setDeletingCourse}
                    onEdit={setEditingCourse}
                  />
                </TabsContent>
                <TabsContent value="card">
                  <CourseCardView
                    canManageCourses={canManageCourses}
                    courses={courses}
                    onDelete={setDeletingCourse}
                    onEdit={setEditingCourse}
                  />
                </TabsContent>
              </>
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
                {canManageCourses && (
                  <EmptyContent>
                    <Button onClick={() => setCreateOpen(true)}>
                      <PlusIcon data-icon="inline-start" />
                      เพิ่มรายวิชา
                    </Button>
                  </EmptyContent>
                )}
              </Empty>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {canManageCourses && (
        <>
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
                setEditingCourse(undefined);
              }
            }}
            onSubmit={updateSelectedCourse}
            open={!!editingCourse}
          />
        </>
      )}
      <AlertDialog
        open={canManageCourses && !!deletingCourse}
        onOpenChange={(open) => !open && setDeletingCourse(undefined)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>ลบรายวิชานี้หรือไม่</AlertDialogTitle>
            <AlertDialogDescription>
              ระบบจะลบรายวิชา {deletingCourse?.code} อย่างถาวร
              และไม่สามารถย้อนกลับได้
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
                event.preventDefault();
                deleteSelectedCourse();
              }}
              variant="destructive"
            >
              {isDeleting ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <Trash2Icon data-icon="inline-start" />
              )}
              ลบรายวิชา
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
