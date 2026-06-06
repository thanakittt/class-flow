"use client"

import { useEffect } from "react"
import { SaveIcon } from "lucide-react"
import { Controller, type FieldErrors, type Resolver, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  COURSE_DAYS,
  courseSchema,
  courseToFormValues,
  emptyCourseFormValues,
  type Course,
  type CourseActionResult,
  type CourseFormValues,
} from "@/modules/course/schemas/course"

type CourseFormDialogProps = {
  course?: Course
  mode: "create" | "edit"
  onOpenChange: (open: boolean) => void
  onSubmit: (values: CourseFormValues) => Promise<CourseActionResult>
  open: boolean
}

const fieldNames = [
  "code",
  "englishName",
  "thaiName",
  "instructor",
  "day",
  "startTime",
  "endTime",
  "location",
  "section",
] as const

const courseFormResolver: Resolver<CourseFormValues> = async (values) => {
  const parsed = courseSchema.safeParse(values)

  if (parsed.success) {
    return {
      values: parsed.data,
      errors: {},
    }
  }

  const fieldErrors = parsed.error.flatten().fieldErrors
  const errors = Object.fromEntries(
    fieldNames.flatMap((name) => {
      const message = fieldErrors[name]?.[0]

      return message
        ? [
            [
              name,
              {
                type: "validation",
                message,
              },
            ],
          ]
        : []
    })
  ) as FieldErrors<CourseFormValues>

  return {
    values: {},
    errors,
  }
}

export function CourseFormDialog({
  course,
  mode,
  onOpenChange,
  onSubmit,
  open,
}: CourseFormDialogProps) {
  const form = useForm<CourseFormValues>({
    resolver: courseFormResolver,
    mode: "onSubmit",
    defaultValues: course ? courseToFormValues(course) : emptyCourseFormValues,
  })

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = form

  useEffect(() => {
    if (open) {
      reset(course ? courseToFormValues(course) : emptyCourseFormValues)
    }
  }, [course, open, reset])

  async function submit(values: CourseFormValues) {
    const result = await onSubmit(values)

    if (result.ok) {
      reset(emptyCourseFormValues)
      onOpenChange(false)
      return
    }

    if (result.fieldErrors) {
      for (const name of fieldNames) {
        const message = result.fieldErrors[name]?.[0]

        if (message) {
          setError(name, { message })
        }
      }

      const rootMessage = result.fieldErrors.root?.[0] ?? result.message
      setError("root", { message: rootMessage })
      return
    }

    setError("root", { message: result.message })
  }

  const isEditMode = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit course" : "Create course"}</DialogTitle>
          <DialogDescription>
            Manage course identity, schedule, instructor, and location.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit(submit)}>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.code}>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input
                  aria-invalid={!!errors.code}
                  id="code"
                  readOnly={isEditMode}
                  {...register("code")}
                />
                <FieldError errors={[errors.code]} />
              </Field>
              <Field data-invalid={!!errors.section}>
                <FieldLabel htmlFor="section">Section</FieldLabel>
                <Input
                  aria-invalid={!!errors.section}
                  id="section"
                  min={1}
                  type="number"
                  {...register("section", { valueAsNumber: true })}
                />
                <FieldError errors={[errors.section]} />
              </Field>
            </div>
            <Field data-invalid={!!errors.englishName}>
              <FieldLabel htmlFor="englishName">English name</FieldLabel>
              <Input
                aria-invalid={!!errors.englishName}
                id="englishName"
                {...register("englishName")}
              />
              <FieldError errors={[errors.englishName]} />
            </Field>
            <Field data-invalid={!!errors.thaiName}>
              <FieldLabel htmlFor="thaiName">Thai name</FieldLabel>
              <Input
                aria-invalid={!!errors.thaiName}
                id="thaiName"
                {...register("thaiName")}
              />
              <FieldError errors={[errors.thaiName]} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.instructor}>
                <FieldLabel htmlFor="instructor">Instructor</FieldLabel>
                <Input
                  aria-invalid={!!errors.instructor}
                  id="instructor"
                  {...register("instructor")}
                />
                <FieldError errors={[errors.instructor]} />
              </Field>
              <Field data-invalid={!!errors.location}>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <Input
                  aria-invalid={!!errors.location}
                  id="location"
                  {...register("location")}
                />
                <FieldError errors={[errors.location]} />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Controller
                control={control}
                name="day"
                render={({ field, fieldState }) => (
                  <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>Day</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger aria-invalid={!!fieldState.error} className="w-full">
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {COURSE_DAYS.map((courseDay) => (
                            <SelectItem key={courseDay} value={courseDay}>
                              {courseDay}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Field data-invalid={!!errors.startTime}>
                <FieldLabel htmlFor="startTime">Start time</FieldLabel>
                <Input
                  aria-invalid={!!errors.startTime}
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                />
                <FieldError errors={[errors.startTime]} />
              </Field>
              <Field data-invalid={!!errors.endTime}>
                <FieldLabel htmlFor="endTime">End time</FieldLabel>
                <Input
                  aria-invalid={!!errors.endTime}
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                />
                <FieldError errors={[errors.endTime]} />
              </Field>
            </div>
          </FieldGroup>
          {errors.root?.message && (
            <p className="text-sm text-destructive" role="alert">
              {errors.root.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? <Spinner data-icon="inline-start" /> : <SaveIcon data-icon="inline-start" />}
              {isEditMode ? "Save changes" : "Create course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
