import * as React from "react"
import { useId } from "react"

import { Button } from "./ui/Button"
import { AutoResizeTextarea } from "./ui/AutoResizeTextarea"
import { Label } from "./ui/Label"

// Add popular locations list
const POPULAR_LOCATIONS = [
  "Andhra Pradesh, India", "Visakhapatnam, India", "Vijayawada, India", "Tirupati, India",
  "Arunachal Pradesh, India", "Itanagar, India",
  "Assam, India", "Guwahati, India", "Dibrugarh, India", "Silchar, India",
  "Bihar, India", "Patna, India", "Gaya, India", "Muzaffarpur, India",
  "Chhattisgarh, India", "Raipur, India", "Bhilai, India", "Bilaspur, India",
  "Goa, India", "Panaji, India", "Margao, India",
  "Gujarat, India", "Ahmedabad, India", "Surat, India", "Vadodara, India", "Rajkot, India",
  "Haryana, India", "Gurugram, India", "Faridabad, India", "Panipat, India",
  "Himachal Pradesh, India", "Shimla, India", "Manali, India", "Dharamshala, India",
  "Jharkhand, India", "Ranchi, India", "Jamshedpur, India", "Dhanbad, India",
  "Karnataka, India", "Bangalore, India", "Mysore, India", "Mangalore, India", "Hubli, India",
  "Kerala, India", "Kochi, India", "Thiruvananthapuram, India", "Kozhikode, India",
  "Madhya Pradesh, India", "Bhopal, India", "Indore, India", "Jabalpur, India", "Gwalior, India",
  "Maharashtra, India", "Mumbai, India", "Pune, India", "Nagpur, India", "Nashik, India", "Aurangabad, India",
  "Manipur, India", "Imphal, India",
  "Meghalaya, India", "Shillong, India",
  "Mizoram, India", "Aizawl, India",
  "Nagaland, India", "Kohima, India", "Dimapur, India",
  "Odisha, India", "Bhubaneswar, India", "Cuttack, India", "Rourkela, India",
  "Punjab, India", "Chandigarh, India", "Ludhiana, India", "Amritsar, India", "Jalandhar, India",
  "Rajasthan, India", "Jaipur, India", "Udaipur, India", "Jodhpur, India", "Kota, India",
  "Sikkim, India", "Gangtok, India",
  "Tamil Nadu, India", "Chennai, India", "Coimbatore, India", "Madurai, India", "Tiruchirappalli, India",
  "Telangana, India", "Hyderabad, India", "Warangal, India", "Nizamabad, India",
  "Tripura, India", "Agartala, India",
  "Uttar Pradesh, India", "Lucknow, India", "Kanpur, India", "Varanasi, India", "Agra, India", "Noida, India", "Ghaziabad, India", "Prayagraj, India",
  "Uttarakhand, India", "Dehradun, India", "Haridwar, India", "Rishikesh, India", "Nainital, India",
  "West Bengal, India", "Kolkata, India", "Howrah, India", "Durgapur, India", "Siliguri, India",
  "Delhi, India",
  "Union Territories, India", "Chandigarh, India", "Puducherry, India", "Lakshadweep, India", "Andaman and Nicobar Islands, India", "Jammu, India", "Srinagar, India", "Leh, India"
];


// Updated props interface
export interface InputWithButtonProps {
  value: string
  onChange: (value: string) => void // Simplified interface
  disabled?: boolean
  placeholder?: string
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
  onChange,
  disabled = false,
  placeholder = "Accepts Boolean/X-Ray search or Job Description"
}: InputWithButtonProps) {
  const id = useId()
  const locationId = useId()
  const experienceId = useId()
  const customExpId = useId()

  // Separate state for each field - no cross-contamination
  const [jobDescription, setJobDescription] = React.useState("")
  const [location, setLocation] = React.useState("")
  const [experience, setExperience] = React.useState("")
  const [customExperience, setCustomExperience] = React.useState("")

  const [locationSuggestions, setLocationSuggestions] = React.useState([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const locationInputRef = React.useRef(null)

  // Filter locations based on input
  const filterLocations = React.useCallback((input) => {
    if (!input.trim()) return []
    return POPULAR_LOCATIONS.filter(loc =>
      loc.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 8) // Show max 8 suggestions
  }, [])

  const handleLocationChange = (e) => {
    const newLocation = e.target.value
    setLocation(newLocation)

    // Show suggestions
    const suggestions = filterLocations(newLocation)
    setLocationSuggestions(suggestions)
    setShowSuggestions(suggestions.length > 0 && newLocation.length > 0)

    updateSearchValue(jobDescription, newLocation)
  }

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation)
    setShowSuggestions(false)
    setLocationSuggestions([])
    updateSearchValue(jobDescription, selectedLocation)
    locationInputRef.current?.focus()
  }

  const handleLocationBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 150)
  }

  // Parse the incoming value only once on mount or when value changes from parent
  React.useEffect(() => {
    if (value !== buildSearchQuery(jobDescription, location, experience, customExperience)) {
      parseSearchQuery(value)
    }
  }, [value])

  // Build search query from individual components
  const buildSearchQuery = (job: string, loc: string, exp: string, customExp: string) => {
    let searchQuery = job.trim()

    if (loc.trim()) {
      searchQuery += ` location:"${loc.trim()}"`
    }

    if (exp.trim()) {
      const expValue = exp === "custom" ? customExp : exp
      if (expValue.trim()) {
        searchQuery += ` experience:"${expValue.trim()}"`
      }
    }

    return searchQuery
  }

  // Parse search query into individual components
  const parseSearchQuery = (searchQuery: string) => {
    // Extract location (quoted or unquoted)
    const locationMatch = searchQuery.match(/location:(?:"([^"]+)"|(\S+))/i)
    const extractedLocation = locationMatch ? (locationMatch[1] || locationMatch[2]) : ""

    // Extract experience (quoted or unquoted)
    const experienceMatch = searchQuery.match(/experience:(?:"([^"]+)"|(\S+))/i)
    const extractedExperience = experienceMatch ? (experienceMatch[1] || experienceMatch[2]) : ""

    // Extract job description (everything except location and experience)
    const jobDesc = searchQuery
      .replace(/location:(?:"[^"]+"|[^\s]+)/gi, '')
      .replace(/experience:(?:"[^"]+"|[^\s]+)/gi, '')
      .trim()

    setJobDescription(jobDesc)
    setLocation(extractedLocation)

    // Determine if it's a standard experience or custom
    const standardExp = experienceOptions.find(opt => opt.value === extractedExperience)
    if (standardExp && standardExp.value !== "custom") {
      setExperience(extractedExperience)
      setCustomExperience("")
    } else if (extractedExperience) {
      setExperience("custom")
      setCustomExperience(extractedExperience)
    } else {
      setExperience("")
      setCustomExperience("")
    }
  }

  // Update search value whenever any field changes
  const updateSearchValue = React.useCallback((
    newJobDescription: string = jobDescription,
    newLocation: string = location,
    newExperience: string = experience,
    newCustomExperience: string = customExperience
  ) => {
    const searchQuery = buildSearchQuery(newJobDescription, newLocation, newExperience, newCustomExperience)
    onChange(searchQuery)
  }, [jobDescription, location, experience, customExperience, onChange])

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newJobDesc = e.target.value
    setJobDescription(newJobDesc)
    updateSearchValue(newJobDesc)
  }

  // const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newLocation = e.target.value
  //   setLocation(newLocation)
  //   updateSearchValue(jobDescription, newLocation)
  // }

  const handleExperienceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newExperience = e.target.value
    setExperience(newExperience)
    if (newExperience !== "custom") {
      setCustomExperience("")
      updateSearchValue(jobDescription, location, newExperience, "")
    } else {
      updateSearchValue(jobDescription, location, newExperience, customExperience)
    }
  }

  const handleCustomExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCustomExp = e.target.value
    setCustomExperience(newCustomExp)
    updateSearchValue(jobDescription, location, experience, newCustomExp)
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
        {/* Main Job Description Search */}
        <div className="space-y-2">
          <AutoResizeTextarea
            id={id}
            value={jobDescription}
            onChange={handleJobDescriptionChange}
            placeholder={placeholder}
            disabled={disabled}
            className="
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
              min-h-[100px]
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          />
        </div>

        {/* Optional Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location Field */}
          <div className="space-y-2 relative">
            <Label htmlFor={locationId} className="text-gray-700 text-sm font-medium">
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <div className="relative">
              <input
                ref={locationInputRef}
                id={locationId}
                type="text"
                value={location}
                onChange={handleLocationChange}
                onFocus={() => location && setShowSuggestions(filterLocations(location).length > 0)}
                onBlur={handleLocationBlur}
                placeholder="e.g., New York, Remote, Mumbai"
                disabled={disabled}
                className="
              w-full bg-gray-50 text-gray-900 placeholder-gray-400 border-2 border-gray-200
              focus:border-blue-500 focus:bg-white rounded-lg p-3 text-sm transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
            "
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 text-sm border-b border-gray-100 last:border-b-0"
                      onClick={() => handleLocationSelect(suggestion)}
                    >
                      📍 {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor={locationId} className="text-gray-700 text-sm font-medium">
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <input
              id={locationId}
              type="text"
              value={location}
              onChange={handleLocationChange}
              placeholder="e.g., New York, Remote, Mumbai"
              disabled={disabled}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            />
          </div> */}

          {/* Experience Dropdown */}
          <div className="space-y-2">
            <Label htmlFor={experienceId} className="text-gray-700 text-sm font-medium">
              Years of Experience <span className="text-gray-400 font-normal">(optional)</span>
            </Label>
            <select
              id={experienceId}
              value={experience}
              onChange={handleExperienceChange}
              disabled={disabled}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
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

        {/* Custom Experience Input */}
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
              disabled={disabled}
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
                disabled:opacity-50
                disabled:cursor-not-allowed
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
            disabled={disabled || !jobDescription.trim()}
            className={`
              px-8 py-3 font-semibold text-sm transition-all duration-200 rounded-lg
              ${(!disabled && jobDescription.trim())
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
