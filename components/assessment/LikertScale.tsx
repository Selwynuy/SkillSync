"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface LikertScaleProps {
  questionId: string
  question: string
  value?: number
  onChange: (value: number) => void
}

const options = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
]

export function LikertScale({
  questionId,
  question,
  value,
  onChange,
}: LikertScaleProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-relaxed">{question}</h3>

      <RadioGroup
        value={value?.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
        className="space-y-3"
      >
        {options.map((option) => (
          <div
            key={option.value}
            className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <RadioGroupItem
              value={option.value.toString()}
              id={`${questionId}-${option.value}`}
            />
            <Label
              htmlFor={`${questionId}-${option.value}`}
              className="flex-1 cursor-pointer font-normal"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
