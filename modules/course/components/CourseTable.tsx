"use client"

import { EditIcon, Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCourseDayLabel, type Course } from "@/modules/course/schemas/course"

type CourseTableProps = {
  canManageCourses: boolean
  courses: Course[]
  onDelete: (course: Course) => void
  onEdit: (course: Course) => void
}

export function CourseTable({
  canManageCourses,
  courses,
  onDelete,
  onEdit,
}: CourseTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>รหัส</TableHead>
          <TableHead>รายวิชา</TableHead>
          <TableHead>ผู้สอน</TableHead>
          <TableHead>เวลาเรียน</TableHead>
          <TableHead>สถานที่</TableHead>
          {canManageCourses && <TableHead className="text-right">การจัดการ</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={`${course.code}-${course.section}`}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <span>{course.code}</span>
                <Badge variant="secondary">หมู่ {course.section}</Badge>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex min-w-56 flex-col gap-1">
                <span>{course.englishName}</span>
                <span className="text-muted-foreground">{course.thaiName}</span>
              </div>
            </TableCell>
            <TableCell>{course.instructor}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{getCourseDayLabel(course.day)}</Badge>
                <span>
                  {course.startTime}-{course.endTime}
                </span>
              </div>
            </TableCell>
            <TableCell>{course.location}</TableCell>
            {canManageCourses && (
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button size="icon-sm" type="button" variant="ghost" onClick={() => onEdit(course)}>
                    <EditIcon />
                    <span className="sr-only">แก้ไขรายวิชา {course.code}</span>
                  </Button>
                  <Button
                    size="icon-sm"
                    type="button"
                    variant="destructive"
                    onClick={() => onDelete(course)}
                  >
                    <Trash2Icon />
                    <span className="sr-only">ลบรายวิชา {course.code}</span>
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
