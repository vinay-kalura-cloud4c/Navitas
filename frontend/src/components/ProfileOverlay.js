import React from 'react'
import { Button } from './ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card'

const ProfileOverlay = ({ profile, isOpen, onClose }) => {
  if (!isOpen || !profile) return null

  const gradient = score => {
    if (score >= 0.8) return 'from-green-500 to-emerald-500'
    if (score >= 0.6) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-rose-500'
  }

  const backdropClick = e => {
    if (e.target.classList.contains('overlay-backdrop')) onClose()
  }

  return (
    <div
      className="overlay-backdrop fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={backdropClick}
    >
      <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in">
        <CardHeader className="relative pb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 h-8 w-8 bg-red-500 text-white hover:bg-red-600"
          >
            ×
          </Button>
          <CardTitle className="text-2xl font-bold mb-2">
            {profile.title}
          </CardTitle>
          <div className={`inline-flex items-center px-4 py-2 text-white rounded-full bg-gradient-to-r ${gradient(profile.score)}`}>
            Match: {Math.round(profile.score * 100)}%
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-2">Profile Summary</h3>
            <CardDescription>{profile.snippet}</CardDescription>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">LinkedIn Profile</h3>
            <a href={profile.link} target="_blank" rel="noopener noreferrer" className="underline text-blue-600">
              {profile.link}
            </a>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">Score Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Overall Match</span>
                <span>{Math.round(profile.score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Experience Level</span>
                <span>
                  {profile.score >= 0.8 ? 'High' : profile.score >= 0.6 ? 'Medium' : 'Entry'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Skills Alignment</span>
                <span>{profile.score >= 0.7 ? 'Excellent' : 'Good'}</span>
              </div>
            </div>
          </section>
        </CardContent>
        <div className="flex gap-3 p-4 border-t">
          <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white" onClick={() => window.open(profile.link, '_blank')}>
            Visit LinkedIn
          </Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ProfileOverlay