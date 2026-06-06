"use client"

import { FormEvent, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COURSE_DAYS } from "@/modules/course/schemas/course"

type CourseFiltersProps = {
  query: string
  day: string
}

export function CourseFilters({ query, day }: CourseFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [draftQuery, setDraftQuery] = useState(query)
  const [draftDay, setDraftDay] = useState(day || "all")

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams()
    const nextQuery = draftQuery.trim()

    if (nextQuery) {
      params.set("q", nextQuery)
    }

    if (draftDay !== "all") {
      params.set("day", draftDay)
    }

    const search = params.toString()
    router.replace(search ? `${pathname}?${search}` : pathname)
  }

  function clearFilters() {
    setDraftQuery("")
    setDraftDay("all")
    router.replace(pathname)
  }

  return (
    <form className="flex flex-col gap-3 md:flex-row md:items-center" onSubmit={applyFilters}>
      <div className="relative min-w-0 flex-1">
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          data-icon="inline-start"
        />
        <Input
          className="pl-8"
          name="q"
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder="Search courses"
          value={draftQuery}
        />
      </div>
      <Select onValueChange={setDraftDay} value={draftDay}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All days</SelectItem>
            {COURSE_DAYS.map((courseDay) => (
              <SelectItem key={courseDay} value={courseDay}>
                {courseDay}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button type="submit">
          <SearchIcon data-icon="inline-start" />
          Search
        </Button>
        <Button type="button" variant="outline" onClick={clearFilters}>
          <XIcon data-icon="inline-start" />
          Clear
        </Button>
      </div>
    </form>
  )
}
