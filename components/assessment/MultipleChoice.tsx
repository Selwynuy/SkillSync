"use client"

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface MultipleChoiceProps {
  questionId: string
  question: string
  options: string[]
  value?: string
  onChange: (value: string) => void
}

export function MultipleChoice({
  questionId,
  question,
  options,
  value,
  onChange,
}: MultipleChoiceProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-relaxed">{question}</h3>

      <RadioGroup value={value} onValueChange={onChange} className="space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <RadioGroupItem
              value={option}
              id={`${questionId}-option-${index}`}
            />
            <Label
              htmlFor={`${questionId}-option-${index}`}
              className="flex-1 cursor-pointer font-normal"
            >
              {option}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}
