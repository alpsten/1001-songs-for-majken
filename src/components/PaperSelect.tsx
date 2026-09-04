import * as Select from "@radix-ui/react-select"

// A dropdown styled to match the paper/index-card aesthetic all the way
// through — including the open state, which a native <select> can't be
// restyled for (the OS renders that part, breaking the illusion). Built on
// Radix's unstyled Select primitive: it handles the accessibility/keyboard
// behavior, we skin every visible part.

type Option = { value: string; label: string }

type PaperSelectProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: Option[]
  ariaLabel: string
  className?: string
}

const ALL = "__all__"

export default function PaperSelect({ value, onValueChange, placeholder, options, ariaLabel, className }: PaperSelectProps) {
  return (
    <Select.Root value={value || ALL} onValueChange={(next) => onValueChange(next === ALL ? "" : next)}>
      <Select.Trigger className={`paper-select-trigger ${className ?? ""}`} aria-label={ariaLabel}>
        {/* Select.Value drops className/style (see @radix-ui/react-select's
            source — it destructures and discards both), so the overflow/
            ellipsis handling has to live on a wrapper around it instead. */}
        <span className="paper-select-value">
          <Select.Value />
        </span>
        <Select.Icon className="paper-select-caret">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="paper-select-content" position="popper" sideOffset={8} collisionPadding={12}>
          <Select.Viewport className="paper-select-viewport">
            <Select.Item value={ALL} className="paper-select-item">
              <Select.ItemText>{placeholder}</Select.ItemText>
            </Select.Item>
            {options.map((option) => (
              <Select.Item key={option.value} value={option.value} className="paper-select-item">
                <Select.ItemText>{option.label}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
