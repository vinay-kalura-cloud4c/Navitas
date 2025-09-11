import React from 'react'
import {
  motion,
  useMotionValue,
  useSpring
} from 'motion/react'

// simple class-names helper
const cn = (...classes) => classes.filter(Boolean).join(' ')

/**
 * generate a long CSS box-shadow string for random stars
 */
function generateStars(count, starColor) {
  const shadows = []
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 4000) - 2000
    const y = Math.floor(Math.random() * 4000) - 2000
    shadows.push(`${x}px ${y}px ${starColor}`)
  }
  return shadows.join(', ')
}

/**
 * One layer of stars moving vertically
 */
function StarLayer({
  count = 1000,
  size = 1,
  transition = { repeat: Infinity, duration: 50, ease: 'linear' },
  starColor = '#fff',
  className,
  ...props
}) {
  const [boxShadow, setBoxShadow] = React.useState('')

  React.useEffect(() => {
    setBoxShadow(generateStars(count, starColor))
  }, [count, starColor])

  return (
    <motion.div
      animate={{ y: [0, -2000] }}
      transition={transition}
      className={cn('absolute top-0 left-0 w-full h-full ', className)}
      {...props}
    >
      <div
        className="absolute bg-transparent rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow
        }}
      />
      <div
        className="absolute bg-transparent rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow
        }}
      />
    </motion.div>
  )
}

/**
 * Wrap your app in this to get a parallax starfield background
 */
export function StarsBackground({
  children,
  className,
  factor = 0.05,
  speed = 50,
  transition = { stiffness: 50, damping: 20 },
  starColor = '#fff',
  ...props
}) {
  const offsetX = useMotionValue(0)
  const offsetY = useMotionValue(0)
  const springX = useSpring(offsetX, transition)
  const springY = useSpring(offsetY, transition)

  const handleMouseMove = React.useCallback(
    (e) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      offsetX.set(-(e.clientX - cx) * factor)
      offsetY.set(-(e.clientY - cy) * factor)
    },
    [factor, offsetX, offsetY]
  )

  return (
    <div
      className={cn(
        'relative w-full  bg-[radial-gradient(ellipse_at_bottom,_#262626_0%,_#000_100%)]',
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      <motion.div style={{ x: springX, y: springY }}>
        <StarLayer
          count={1000}
          size={1}
          transition={{ repeat: Infinity, duration: speed, ease: 'linear' }}
          starColor={starColor}
        />
        <StarLayer
          count={400}
          size={2}
          transition={{
            repeat: Infinity,
            duration: speed * 2,
            ease: 'linear'
          }}
          starColor={starColor}
        />
        <StarLayer
          count={200}
          size={3}
          transition={{
            repeat: Infinity,
            duration: speed * 3,
            ease: 'linear'
          }}
          starColor={starColor}
        />
      </motion.div>
      {children}
    </div>
  )
}