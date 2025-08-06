import * as React from "react"
import { useId } from "react"

import { Button } from "./ui/Button"
import { AutoResizeTextarea } from "./ui/AutoResizeTextarea"
import { Label } from "./ui/Label"

// Updated props interface for textarea
export interface InputWithButtonProps {
  value: string
  onChange: React.ChangeEventHandler<HTMLTextAreaElement>
}

export default function InputWithButton({
  value,
  onChange
}: InputWithButtonProps) {
  const id = useId()
  return (
    <div className="bg-white p-4 rounded-md space-y-3">
      <Label htmlFor={id} className="text-black text-lg font-medium">
        Enter the Job Description
      </Label>
      <div className="flex flex-col gap-3">
        <AutoResizeTextarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder="Describe the job role, required skills, experience level, and any specific qualifications you're looking for..."
          minRows={3}
          maxRows={12}
          className="
            flex-1
            bg-gray-50
            text-gray-900
            placeholder-gray-500
            border-2
            border-gray-200
            focus:border-blue-500
            focus:bg-white
            rounded-lg
            p-4
            text-base
            leading-relaxed
            transition-all
            duration-200
          "
        />
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 flex-shrink-0">
            {value.length} characters
            {value.length > 500 && (
              <span className="ml-2 text-green-600">
                ✓ Detailed description
              </span>
            )}
          </div>
          <div className="flex-grow flex justify-end">
            <Button
              type="submit"
              disabled={!value.trim()}
              className={`
                px-6 py-2 font-semibold transition-all duration-200
                ${value.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              Search Profiles
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}