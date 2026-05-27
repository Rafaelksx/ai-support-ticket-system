import * as React from "react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options = [], ...props }, ref) => (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} className="bg-slate-900 text-slate-100">
          {option.label}
        </option>
      ))}
    </select>
  )
)
Select.displayName = "Select"

export { Select }
