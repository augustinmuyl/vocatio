"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/useMediaQuery"

export type ComboboxOption = {
  value: string
  label: string
}

export type ComboboxProps = {
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null, option?: ComboboxOption) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  buttonClassName?: string
  contentClassName?: string
  buttonWidthClassName?: string
}

export function Combobox({
  options,
  value: controlledValue,
  defaultValue = null,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  buttonClassName,
  contentClassName,
  buttonWidthClassName = "w-[200px]",
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [uncontrolledValue, setUncontrolledValue] = React.useState<string | null>(
    defaultValue ?? null
  )
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue ?? null : uncontrolledValue

  const selected =
    value != null ? options.find((o) => o.value === value) : undefined

  const handleSelect = (currentValue: string) => {
    const nextValue = currentValue === value ? null : currentValue
    if (!isControlled) {
      setUncontrolledValue(nextValue)
    }
    onChange?.(
      nextValue,
      nextValue != null ? options.find((o) => o.value === nextValue) : undefined
    )
    setOpen(false)
  }

  const list = (
    <Command>
      <CommandInput placeholder={searchPlaceholder} className="h-9" />
      <CommandList>
        <CommandEmpty>{emptyText}</CommandEmpty>
        <CommandGroup>
          {options.map((option) => (
            <CommandItem
              key={option.value}
              value={option.value}
              onSelect={handleSelect}
            >
              {option.label}
              <Check
                className={cn(
                  "ml-auto",
                  value === option.value ? "opacity-100" : "opacity-0"
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              buttonWidthClassName,
              "justify-between",
              buttonClassName
            )}
          >
            {selected ? selected.label : placeholder}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn("p-0", buttonWidthClassName, contentClassName)}
          align="start"
        >
          {list}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            buttonWidthClassName,
            "justify-between",
            buttonClassName
          )}
        >
          {selected ? selected.label : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">{list}</div>
      </DrawerContent>
    </Drawer>
  )
}

// Backwards-compatible alias in case existing imports use the demo name
export const ComboboxDemo = Combobox
