import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card'
import { Button } from './ui/Button'

const ProfileCard = ({ profile, onViewDetails }) => {
  const gradientClass = (score) => {
    if (score >= 0.8) return 'from-green-400 to-green-600'
    if (score >= 0.6) return 'from-yellow-400 to-yellow-600'
    return 'from-red-400 to-red-600'
  }

  const truncate = (text, max = 120) =>
    text.length > max ? text.slice(0, max).trim() + '…' : text

  const scorePercent = Math.round(profile.score * 100)

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex justify-between items-start pb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 mr-2">
          {profile.title}
        </h3>
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
          View LinkedIn
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