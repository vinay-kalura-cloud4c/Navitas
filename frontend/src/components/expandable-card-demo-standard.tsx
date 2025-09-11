"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../hooks/use-outside-click";
import { Button } from "./ui/Button";

export interface Profile {
  id: string | number;
  name: string;
  short_summary: string;
  full_summary: string;
  link: string;
  score: number;
  platform?: string; // Add platform field
}

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
  default: {
    name: 'Profile',
    color: 'bg-blue-600',
    textColor: 'text-blue-600',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  }
};

export default function ExpandableCardDemo({
  cards,
  selectedProfiles,
  onProfileSelection,
  onRemove,
  showRemoveButton = false,
}: {
  cards: Profile[];
  selectedProfiles?: Set<string | number>;
  onProfileSelection?: (profileId: string | number, isSelected: boolean) => void;
  onRemove?: (profileId: string | number) => void;
  showRemoveButton?: boolean;
}) {
  const [active, setActive] = useState<Profile | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.body.style.overflow = active ? "hidden" : "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  const handleCheckboxChange = (profileId: string | number, isChecked: boolean) => {
    if (onProfileSelection) {
      onProfileSelection(profileId, isChecked);
    }
  };

  const getPlatform = (profile: Profile) => {
    console.log(profile)
    return PLATFORMS[profile.platform?.toLowerCase() as keyof typeof PLATFORMS] || PLATFORMS.default;
  };

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10"
            onClick={() => setActive(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 grid place-items-center z-20">
            <motion.button
              layout
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow"
              onClick={() => setActive(null)}
            >
              ×
            </motion.button>

            <motion.div
              layoutId={`card-${active.id}-${id}`}
              ref={ref}
              className="w-full max-w-xl bg-white p-6 rounded-xl shadow-lg overflow-auto max-h-[80vh]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <motion.h3
                    layoutId={`title-${active.id}-${id}`}
                    className="text-2xl font-bold mb-2"
                  >
                    {active.name}
                  </motion.h3>

                  {/* Platform indicator in modal */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded ${getPlatform(active).color} text-white`}>
                      {getPlatform(active).icon}
                    </div>
                    <span className={`text-sm font-medium ${getPlatform(active).textColor}`}>
                      {getPlatform(active).name}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-gray-800 mb-4">
                {active.full_summary}
              </div>

              <a
                href={active.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline mb-2 block"
              >
                View profile link
              </a>
              <p className="text-sm text-gray-500 mb-4">Score: {active.score}</p>

              <div className="flex gap-2 items-center">
                {selectedProfiles && onProfileSelection && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.has(active.id)}
                      onChange={(e) => handleCheckboxChange(active.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Select for saving</span>
                  </div>
                )}
                {showRemoveButton && onRemove && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(active.id);
                      setActive(null);
                    }}
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => {
          const isSelected = selectedProfiles?.has(card.id) || false;

          return (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}-${id}`}
              className={`p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
            >
              {/* Checkbox in top-right corner */}
              {selectedProfiles && onProfileSelection && (
                <div className="flex justify-end mb-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleCheckboxChange(card.id, e.target.checked);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              )}

              <div onClick={() => setActive(card)}>
                <motion.h3
                  layoutId={`title-${card.id}-${id}`}
                  className="font-bold text-lg mb-2"
                >
                  {card.name}
                </motion.h3>

                {/* Platform indicator in card */}
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1 rounded ${getPlatform(card).color} text-white`}>
                    {getPlatform(card).icon}
                  </div>
                  <span className={`text-xs font-medium ${getPlatform(card).textColor}`}>
                    {getPlatform(card).name}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {card.short_summary}
                </p>

                <div className="flex gap-2 items-center mt-3">
                  <Button size="sm">View Details</Button>
                  {showRemoveButton && onRemove && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(card.id);
                      }}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}
