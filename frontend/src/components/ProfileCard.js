import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'

// Platform configuration
const PLATFORMS = {
  linkedin: {
    name: 'LinkedIn',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  },
  github: {
    name: 'GitHub',
    color: 'bg-gray-800',
    textColor: 'text-gray-800',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    )
  },
  indeed: {
    name: 'Indeed',
    color: 'bg-blue-700',
    textColor: 'text-blue-700',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.566 21.563v-8.762c0-.897.688-1.637 1.558-1.637.89 0 1.558.74 1.558 1.637v8.762c2.869-.4 4.938-2.869 4.938-5.778 0-2.909-2.069-5.379-4.938-5.779v4.317c0 .897-.668 1.637-1.558 1.637-.87 0-1.558-.74-1.558-1.637V9.985c-2.869.4-4.938 2.91-4.938 5.8 0 2.909 2.069 5.378 4.938 5.778zM13.124 8.02c.87 0 1.558-.74 1.558-1.637V1.637c0-.897-.688-1.637-1.558-1.637-.89 0-1.558.74-1.558 1.637v4.746c0 .897.668 1.637 1.558 1.637z" />
      </svg>
    )
  },
  // Add more platforms as needed
  default: {
    name: 'Unknown',
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    )
  }
}

const ProfileCard = ({ profile, onViewDetails }) => {
  const gradientClass = (score) => {
    if (score >= 0.8) return 'from-green-400 to-green-600'
    if (score >= 0.6) return 'from-yellow-400 to-yellow-600'
    return 'from-red-400 to-red-600'
  }

  const truncate = (text, max = 120) =>
    text.length > max ? text.slice(0, max).trim() + '…' : text

  const scorePercent = Math.round(profile.score * 100)

  // Get platform configuration (fallback to 'default' if platform not found)
  const platform = PLATFORMS[profile.platform?.toLowerCase()] || PLATFORMS.default

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex justify-between items-start pb-2">
        <div className="flex-1 mr-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {profile.title}
          </h3>
          {/* Platform indicator */}
          <div className="flex items-center gap-1">
            <div className={`p-1 rounded ${platform.color} text-white`}>
              {platform.icon}
            </div>
            <span className={`text-xs font-medium ${platform.textColor}`}>
              {platform.name}
            </span>
          </div>
        </div>
        <span
          className={
            `inline-block text-white text-sm font-medium px-2 py-1 rounded ` +
            `bg-gradient-to-r ${gradientClass(profile.score)}`
          }
        >
          {scorePercent}%
        </span>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-gray-600">{truncate(profile.snippet)}</p>
      </CardContent>

      <CardFooter className="pt-2 flex justify-between items-center">
        <a
          href={profile.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline text-sm"
        >
          View Profile
        </a>
        <Button
          size="sm"
          variant="outline"
          className="text-sm"
          onClick={() => onViewDetails(profile)}
        >
          View More
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ProfileCard
