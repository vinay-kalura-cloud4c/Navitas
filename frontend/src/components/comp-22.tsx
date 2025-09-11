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

const experienceOptions = [
  { value: "", label: "Any Experience" },
  { value: "Entry Level", label: "Entry Level (0-1 years)" },
  { value: "1-3 years", label: "1-3 years" },
  { value: "3-5 years", label: "3-5 years" },
  { value: "5+ years", label: "5+ years" },
  { value: "custom", label: "Custom" }
]

export default function TalentSearchBar({
  value,
  onChange
}: InputWithButtonProps) {
  const id = useId()
  const locationId = useId()
  const experienceId = useId()
  const customExpId = useId()

  const [location, setLocation] = React.useState("")
  const [experience, setExperience] = React.useState("")
  const [customExperience, setCustomExperience] = React.useState("")
  const [isExpanded, setIsExpanded] = React.useState(false)

  // Function to update the main value with all search criteria
  const updateSearchValue = React.useCallback((
    jobDescription: string,
    locationValue: string = location,
    experienceValue: string = experience
  ) => {
    let searchQuery = jobDescription

    if (locationValue.trim()) {
      searchQuery += ` location:${locationValue.trim()}`
    }

    if (experienceValue.trim()) {
      const expValue = experienceValue === "custom" ? customExperience : experienceValue
      if (expValue.trim()) {
        searchQuery += ` experience:${expValue.trim()}`
      }
    }

    // Create a synthetic event to match the expected onChange signature
    const syntheticEvent = {
      target: { value: searchQuery },
      currentTarget: { value: searchQuery }
    } as React.ChangeEvent<HTMLTextAreaElement>

    onChange(syntheticEvent)
  }, [location, experience, customExperience, onChange])

  // Extract job description from value (remove location and experience parts)
  const getJobDescription = React.useCallback(() => {
    return value.replace(/\s*location:[^\s]+/gi, '').replace(/\s*experience:[^\s]+/gi, '').trim()
  }, [value])

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const jobDesc = e.target.value
    updateSearchValue(jobDesc)
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value
    setLocation(newLocation)
    updateSearchValue(getJobDescription(), newLocation, experience)
  }

  const handleExperienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newExperience = e.target.value
    setExperience(newExperience)
    updateSearchValue(getJobDescription(), location, newExperience)
  }

  const handleCustomExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomExp = e.target.value
    setCustomExperience(newCustomExp)
    if (experience === "custom") {
      updateSearchValue(getJobDescription(), location, "custom")
    }
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const getActiveExperienceLabel = () => {
    if (!experience) return ""
    if (experience === "custom") return customExperience || "Custom"
    return experience
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-black text-xl font-semibold text-center w-full">
          Your Talent Search Starts Here
        </Label>
      </div>

      <div className="flex flex-col gap-4">
        {/* Main Job Description Search - Expandable */}
        <div className="space-y-2">
          <AutoResizeTextarea
            id={id}
            value={getJobDescription()}
            onChange={handleJobDescriptionChange}
            placeholder="Accepts Boolean/X-Ray search or Job Description"

            className={`
              w-full
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
              duration-300
              resize-y
              ${isExpanded ? 'min-h-[200px]' : 'min-h-[100px]'}
            `}
          />
        </div>

        {/* Optional Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Field */}
          <div className="space-y-2">
            <Label htmlFor={locationId} className="text-gray-700 text-sm font-medium">
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <input
              id={locationId}
              type="text"
              value={location}
              onChange={handleLocationChange}
              placeholder="e.g., New York, Remote, Mumbai"
              className="
                w-full
                bg-gray-50
                text-gray-900
                placeholder-gray-400
                border-2
                border-gray-200
                focus:border-blue-500
                focus:bg-white
                rounded-lg
                p-3
                text-sm
                transition-all
                duration-200
              "
            />
          </div>

          {/* Experience Dropdown */}
          <div className="space-y-2">
            <Label htmlFor={experienceId} className="text-gray-700 text-sm font-medium">
              Years of Experience <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <select
              id={experienceId}
              value={experience}
              onChange={handleExperienceChange}
              className="
                w-full
                bg-gray-50
                text-gray-900
                border-2
                border-gray-200
                focus:border-blue-500
                focus:bg-white
                rounded-lg
                p-3
                text-sm
                transition-all
                duration-200
                cursor-pointer
              "
            >
              {experienceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Experience Input - Shows when Custom is selected */}
        {experience === "custom" && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <Label htmlFor={customExpId} className="text-gray-700 text-sm font-medium">
              Custom Experience Range
            </Label>
            <input
              id={customExpId}
              type="text"
              value={customExperience}
              onChange={handleCustomExperienceChange}
              placeholder="e.g., 7-10 years, 10+ years, Fresher"
              className="
                w-full
                bg-blue-50
                text-gray-900
                placeholder-gray-400
                border-2
                border-blue-200
                focus:border-blue-500
                focus:bg-white
                rounded-lg
                p-3
                text-sm
                transition-all
                duration-200
              "
            />
          </div>
        )}

        {/* Search Info and Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
          <div className="text-sm text-gray-600 space-y-1">
            <div>
              {value.length} characters
              {value.length > 100 && (
                <span className="ml-2 text-green-600 font-medium">
                  ✓ Detailed search query
                </span>
              )}
            </div>
            {(location || getActiveExperienceLabel()) && (
              <div className="text-xs text-blue-600">
                Active filters: {location && `Location: ${location}`} {location && getActiveExperienceLabel() && ' • '} {getActiveExperienceLabel() && `Experience: ${getActiveExperienceLabel()}`}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!getJobDescription().trim()}
            className={`
              px-8 py-3 font-semibold text-sm transition-all duration-200 rounded-lg
              ${getJobDescription().trim()
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            Search Talent
          </Button>
        </div>

      </div>
    </div>
  )
}
