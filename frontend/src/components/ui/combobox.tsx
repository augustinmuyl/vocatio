"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export type ComboboxOption = {
  value: string;
  label: string;
};

export type ComboboxProps = {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, option?: ComboboxOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  buttonClassName?: string;
  contentClassName?: string;
  buttonWidthClassName?: string;
};

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
  // Separate open states to avoid cross-opening the hidden variant
  const [openPopover, setOpenPopover] = React.useState(false);
  const [openDrawer, setOpenDrawer] = React.useState(false);
  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    string | null
  >(defaultValue ?? null);
  // Avoid SSR/client markup mismatch by not branching on media query during render.
  // We render both desktop (Popover) and mobile (Drawer) variants and hide/show via CSS.

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? (controlledValue ?? null) : uncontrolledValue;

  const selected =
    value != null ? options.find((o) => o.value === value) : undefined;

  const handleSelect = (currentValue: string) => {
    const nextValue = currentValue === value ? null : currentValue;
    if (!isControlled) {
      setUncontrolledValue(nextValue);
    }
    onChange?.(
      nextValue,
      nextValue != null
        ? options.find((o) => o.value === nextValue)
        : undefined,
    );
    setOpenPopover(false);
    setOpenDrawer(false);
  };

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
                  value === option.value ? "opacity-100" : "opacity-0",
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <>
      <div className="hidden md:block">
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openPopover}
              className={cn(
                buttonWidthClassName,
                "justify-between",
                buttonClassName,
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
      </div>

      <div className="md:hidden">
        <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
          <DrawerTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={openDrawer}
              className={cn(
                buttonWidthClassName,
                "justify-between",
                buttonClassName,
              )}
            >
              {selected ? selected.label : placeholder}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </DrawerTrigger>
          <DrawerContent aria-label={placeholder || "Select an option"}>
            <VisuallyHidden asChild>
              <DrawerTitle>{placeholder || "Select an option"}</DrawerTitle>
            </VisuallyHidden>

            <div className="mt-4 border-t">{list}</div>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}

// Backwards-compatible alias in case existing imports use the demo name
export const ComboboxDemo = Combobox;
