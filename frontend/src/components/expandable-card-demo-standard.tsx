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
}

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
              <motion.h3
                layoutId={`title-${active.id}-${id}`}
                className="text-2xl font-bold mb-2"
              >
                {active.name}
              </motion.h3>

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
                  className="font-bold text-lg mb-1"
                >
                  {card.name}
                </motion.h3>

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
