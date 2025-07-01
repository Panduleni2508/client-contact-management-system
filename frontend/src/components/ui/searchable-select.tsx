
import * as React from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
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

export interface SearchableSelectOption {
  value: string
  label: string
  searchableText?: string
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  multiSelect?: boolean
  selectedValues?: string[]
  onMultiValueChange?: (values: string[]) => void
}

const SearchableSelect = React.forwardRef<
  HTMLButtonElement,
  SearchableSelectProps
>(({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
  multiSelect = false,
  selectedValues = [],
  onMultiValueChange,
  ...props
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  // Filter options based on search - show all options when dropdown is open
  const filteredOptions = React.useMemo(() => {
    if (!search) {
      return options // Show all options when no search
    }
    
    return options.filter((option) => {
      const searchText = option.searchableText || option.label
      return searchText.toLowerCase().includes(search.toLowerCase())
    })
  }, [options, search])

  const handleSelect = (selectedValue: string) => {
    if (multiSelect && onMultiValueChange) {
      const newSelectedValues = selectedValues.includes(selectedValue)
        ? selectedValues.filter(v => v !== selectedValue)
        : [...selectedValues, selectedValue]
      onMultiValueChange(newSelectedValues)
    } else {
      onValueChange?.(selectedValue)
      setOpen(false)
    }
  }

  const selectedOption = options.find(option => option.value === value)
  
  const getDisplayText = () => {
    if (multiSelect) {
      if (selectedValues.length === 0) return placeholder
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || placeholder
      }
      return `${selectedValues.length} selected`
    }
    return selectedOption?.label || placeholder
  }

  const clearMultiSelection = (e: React.MouseEvent) => {
    e.stopPropagation()
    onMultiValueChange?.([])
  }

  const removeSelectedItem = (valueToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (multiSelect && onMultiValueChange) {
      const newSelectedValues = selectedValues.filter(v => v !== valueToRemove)
      onMultiValueChange(newSelectedValues)
    }
  }

  return (
    <div className="w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", className)}
            disabled={disabled}
            {...props}
          >
            <span className="truncate">{getDisplayText()}</span>
            <div className="flex items-center gap-1">
              {multiSelect && selectedValues.length > 0 && (
                <X 
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100" 
                  onClick={clearMultiSelection}
                />
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3 bg-white">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-gray-500" />
              <CommandInput
                placeholder={searchPlaceholder}
                value={search}
                onValueChange={setSearch}
                className="flex h-10 w-full rounded-md bg-white py-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none disabled:cursor-not-allowed disabled:opacity-50 border-0"
              />
            </div>
            <CommandList className="max-h-[300px] bg-white overflow-y-auto">
              <CommandEmpty className="py-6 text-center text-sm text-gray-500">{emptyText}</CommandEmpty>
              <CommandGroup className="bg-white">
                {filteredOptions.map((option) => {
                  const isSelected = multiSelect 
                    ? selectedValues.includes(option.value)
                    : value === option.value
                  
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value)}
                      className="cursor-pointer bg-white hover:bg-gray-100 text-gray-900"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Show selected items as chips/tags below the dropdown */}
      {multiSelect && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedValues.map((selectedValue) => {
            const selectedOption = options.find(opt => opt.value === selectedValue)
            if (!selectedOption) return null
            
            return (
              <div
                key={selectedValue}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-md border"
              >
                <span className="truncate max-w-[200px]">{selectedOption.label}</span>
                <X
                  className="h-3 w-3 cursor-pointer hover:text-blue-600"
                  onClick={(e) => removeSelectedItem(selectedValue, e)}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

SearchableSelect.displayName = "SearchableSelect"

export { SearchableSelect }
