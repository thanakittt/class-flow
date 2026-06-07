"use client"

import { useEffect, useState } from "react"
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type ThemePreference = "light" | "dark" | "system"

type ResolvedTheme = "light" | "dark"

const THEME_STORAGE_KEY = "class-flow-theme"
const THEME_PREFERENCES = ["light", "dark", "system"] as const

function isThemePreference(value: string | null): value is ThemePreference {
  return THEME_PREFERENCES.some((preference) => preference === value)
}

function getStoredPreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system"
  }

  try {
    const preference = window.localStorage.getItem(THEME_STORAGE_KEY)

    return isThemePreference(preference) ? preference : "system"
  } catch {
    return "system"
  }
}

function getSystemTheme(): ResolvedTheme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark"
  }

  return "light"
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === "system" ? getSystemTheme() : preference
}

function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement

  root.classList.toggle("dark", theme === "dark")
  root.style.colorScheme = theme
}

export function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>(getStoredPreference)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(getStoredPreference())
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference)
    } catch {
      // ถ้า storage ใช้ไม่ได้ ธีมที่เลือกยังมีผลในแท็บนี้
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const updateTheme = () => {
      const nextTheme = resolveTheme(preference)

      setResolvedTheme(nextTheme)
      applyTheme(nextTheme)
    }

    updateTheme()

    if (preference === "system") {
      media.addEventListener("change", updateTheme)

      return () => media.removeEventListener("change", updateTheme)
    }
  }, [preference])

  const TriggerIcon =
    preference === "system" ? LaptopIcon : resolvedTheme === "dark" ? MoonIcon : SunIcon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" type="button" variant="outline" aria-label="เปลี่ยนธีม">
          <TriggerIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>ธีม</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) => {
            if (isThemePreference(value)) {
              setPreference(value)
            }
          }}
        >
          <DropdownMenuRadioItem value="light">
            <SunIcon />
            สว่าง
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <MoonIcon />
            มืด
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <LaptopIcon />
            ตามระบบ
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
