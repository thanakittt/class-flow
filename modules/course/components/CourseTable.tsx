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
import type { Course } from "@/modules/course/schemas/course"

type CourseTableProps = {
  courses: Course[]
  onDelete: (course: Course) => void
  onEdit: (course: Course) => void
}

export function CourseTable({ courses, onDelete, onEdit }: CourseTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Instructor</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courses.map((course) => (
          <TableRow key={`${course.code}-${course.section}`}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                <span>{course.code}</span>
                <Badge variant="secondary">Sec {course.section}</Badge>
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
                <Badge variant="outline">{course.day}</Badge>
                <span>
                  {course.startTime}-{course.endTime}
                </span>
              </div>
            </TableCell>
            <TableCell>{course.location}</TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button size="icon-sm" type="button" variant="ghost" onClick={() => onEdit(course)}>
                  <EditIcon />
                  <span className="sr-only">Edit {course.code}</span>
                </Button>
                <Button
                  size="icon-sm"
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(course)}
                >
                  <Trash2Icon />
                  <span className="sr-only">Delete {course.code}</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
