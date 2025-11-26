import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface MascotProps {
  emotion: 'happy' | 'thinking' | 'excited' | 'confused' | 'sad' | 'celebrating';
  color?: string;
  size?: number;
  eyeSize?: number;
  mouthType?: 'smile' | 'frown' | 'surprise' | 'neutral' | 'open';
  eyeShape?: 'round' | 'oval' | 'wide' | 'narrow';
}

const Mascot = ({
  emotion,
  color = '#3b82f6',
  size = 120,
  eyeSize,
  mouthType,
  eyeShape
}: MascotProps) => {
  const [isBlinking, setIsBlinking] = useState(false);

  // Random blinking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, Math.random() * 3000 + 2000);

    return () => clearInterval(interval);
  }, []);

  const getEmotionConfig = () => {
    switch (emotion) {
      case 'happy':
        return {
          animation: { y: [0, -5, 0], transition: { duration: 2, repeat: Infinity } },
          mouthType: 'smile' as const,
          eyeShape: 'round' as const,
          eyeSize: 18,
          eyeSpacing: 1.2,
          showSparkles: false
        };
      case 'thinking':
        return {
          animation: { rotate: [0, -10, 10, 0], transition: { duration: 1.5, repeat: Infinity } },
          mouthType: 'neutral' as const,
          eyeShape: 'narrow' as const,
          eyeSize: 20,
          eyeSpacing: 1.5,
          showSparkles: false
        };
      case 'excited':
        return {
          animation: { scale: [1, 1.1, 1], transition: { duration: 0.5, repeat: Infinity } },
          mouthType: 'open' as const,
          eyeShape: 'wide' as const,
          eyeSize: 22,
          eyeSpacing: 1.1,
          showSparkles: true
        };
      case 'confused':
        return {
          animation: { rotate: [-5, 5, -5], transition: { duration: 0.8, repeat: Infinity } },
          mouthType: 'surprise' as const,
          eyeShape: 'round' as const,
          eyeSize: 16,
          eyeSpacing: 1.8,
          showSparkles: false
        };
      case 'sad':
        return {
          animation: { y: [0, 2, 0], transition: { duration: 2, repeat: Infinity } },
          mouthType: 'frown' as const,
          eyeShape: 'oval' as const,
          eyeSize: 14,
          eyeSpacing: 1.3,
          showSparkles: false
        };
      case 'celebrating':
        return {
          animation: { rotate: [0, 10, -10, 0], scale: [1, 1.2, 1], transition: { duration: 1, repeat: Infinity } },
          mouthType: 'open' as const,
          eyeShape: 'wide' as const,
          eyeSize: 24,
          eyeSpacing: 1.0,
          showSparkles: true
        };
      default:
        return {
          animation: { y: [0, -5, 0], transition: { duration: 2, repeat: Infinity } },
          mouthType: 'smile' as const,
          eyeShape: 'round' as const,
          eyeSize: 18,
          eyeSpacing: 1.2,
          showSparkles: false
        };
    }
  };

  const emotionConfig = getEmotionConfig();

  // Use emotion defaults, override with props if provided
  const finalMouthType = mouthType ?? emotionConfig.mouthType;
  const finalEyeShape = eyeShape ?? emotionConfig.eyeShape;
  const finalEyeSize = eyeSize ?? emotionConfig.eyeSize;

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={emotionConfig.animation}
    >
      {/* Main body - circular with gradient */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}40, ${color}80, ${color})`,
          boxShadow: `0 0 30px ${color}30, inset 0 0 20px rgba(255,255,255,0.1)`
        }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Inner circle for depth */}
        <div
          className="absolute inset-2 rounded-full"
          style={{
            background: `radial-gradient(circle at 70% 70%, rgba(255,255,255,0.3), rgba(255,255,255,0.1), transparent)`
          }}
        />
      </motion.div>

      {/* Eyes */}
      <motion.div
        className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex gap-3"
        animate={isBlinking ? { scaleY: 0.1 } : { scaleY: 1 }}
        transition={{ duration: 0.1 }}
        style={{ gap: `${finalEyeSize * 0.3}px` }}
      >
        <motion.div
          className={`bg-white shadow-inner ${
            finalEyeShape === 'round' ? 'rounded-full' :
            finalEyeShape === 'oval' ? 'rounded-full' :
            finalEyeShape === 'wide' ? 'rounded-full' :
            'rounded-full'
          }`}
          style={{
            width: finalEyeSize,
            height: finalEyeShape === 'wide' ? finalEyeSize * 0.6 :
                   finalEyeShape === 'narrow' ? finalEyeSize * 1.4 :
                   finalEyeShape === 'oval' ? finalEyeSize * 0.8 : finalEyeSize,
            boxShadow: `inset 0 0 4px rgba(0,0,0,0.2)`
          }}
          animate={emotion === 'celebrating' ? { rotate: [0, 360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`bg-white shadow-inner ${
            finalEyeShape === 'round' ? 'rounded-full' :
            finalEyeShape === 'oval' ? 'rounded-full' :
            finalEyeShape === 'wide' ? 'rounded-full' :
            'rounded-full'
          }`}
          style={{
            width: finalEyeSize,
            height: finalEyeShape === 'wide' ? finalEyeSize * 0.6 :
                   finalEyeShape === 'narrow' ? finalEyeSize * 1.4 :
                   finalEyeShape === 'oval' ? finalEyeSize * 0.8 : finalEyeSize,
            boxShadow: `inset 0 0 4px rgba(0,0,0,0.2)`
          }}
          animate={emotion === 'celebrating' ? { rotate: [0, -360] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Mouth */}
      <motion.div
        className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: emotion === 'excited' ? [1, 1.2, 1] : 1,
          rotate: emotion === 'thinking' ? [0, 5, -5, 0] : 0
        }}
        transition={{ duration: 0.5, repeat: emotion === 'excited' ? Infinity : 0 }}
      >
        {finalMouthType === 'smile' && (
          <motion.svg
            width="32"
            height="16"
            viewBox="0 0 32 16"
            className="text-gray-800"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <path
              d="M4 8 Q16 14 28 8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        )}
        {finalMouthType === 'frown' && (
          <motion.svg
            width="32"
            height="16"
            viewBox="0 0 32 16"
            className="text-gray-800"
            animate={{ y: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <path
              d="M4 8 Q16 2 28 8"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </motion.svg>
        )}
        {finalMouthType === 'surprise' && (
          <motion.div
            className="w-4 h-4 bg-gray-800 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}
        {finalMouthType === 'neutral' && (
          <motion.div
            className="w-6 h-0.5 bg-gray-800 rounded"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {finalMouthType === 'open' && (
          <motion.svg
            width="24"
            height="12"
            viewBox="0 0 24 12"
            className="text-gray-800"
          >
            <ellipse
              cx="12"
              cy="6"
              rx="10"
              ry="4"
              fill="currentColor"
            />
          </motion.svg>
        )}
      </motion.div>

      {/* Sparkle effects for special emotions */}
      {emotionConfig.showSparkles && (
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 text-lg"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 0
            }}
          >
            ✨
          </motion.div>
          <motion.div
            className="absolute bottom-0 left-0 text-lg"
            animate={{
              scale: [0, 1, 0],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: 1
            }}
          >
            ✨
          </motion.div>
        </div>
      )}

      {/* Floating particles for celebrating */}
      {emotionConfig.showSparkles && emotion === 'celebrating' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                top: `${10 + (i % 2) * 20}%`
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, Math.sin(i) * 20, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      )}

      {/* Thought bubble for thinking */}
      {emotion === 'thinking' && (
        <motion.div
          className="absolute -top-8 -right-4 bg-white/90 text-gray-800 px-2 py-1 rounded-lg text-xs font-medium shadow-lg"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Hmm...
        </motion.div>
      )}
    </motion.div>
  );
};

export default Mascot;

