import { motion } from 'framer-motion';
import { useMemo } from 'react';

type Emotion =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'sad'
  | 'thinking'
  | 'processing'
  | 'shy';

interface InteractiveMascotProps {
  emotion: Emotion;
  size?: number;
  message?: string;
  color?: string;
}

type EyeExpression = 'normal' | 'closed' | 'smile' | 'wide' | 'focus';
type MouthExpression = 'smile' | 'bigSmile' | 'open' | 'frown' | 'neutral' | 'o';
type ArmPose = 'rest' | 'cover' | 'celebrate' | 'focus';

interface EmotionConfig {
  animation: Record<string, unknown>;
  eyeExpression: EyeExpression;
  mouthExpression: MouthExpression;
  cheeks?: boolean;
  sparkle?: boolean;
  tear?: boolean;
  thought?: string;
  accessory?: 'clipboard' | 'magnifier';
  armPose?: ArmPose;
}

const emotionConfigs: Record<Emotion, EmotionConfig> = {
  idle: {
    animation: { y: [0, -4, 0], transition: { duration: 2, repeat: Infinity } },
    eyeExpression: 'normal',
    mouthExpression: 'smile',
    cheeks: true,
    armPose: 'rest',
  },
  happy: {
    animation: { y: [0, -8, 0], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } },
    eyeExpression: 'smile',
    mouthExpression: 'bigSmile',
    cheeks: true,
    sparkle: true,
    armPose: 'celebrate',
  },
  excited: {
    animation: {
      scale: [1, 1.06, 1],
      rotate: [-2, 2, -2],
      transition: { duration: 0.8, repeat: Infinity },
    },
    eyeExpression: 'wide',
    mouthExpression: 'open',
    cheeks: true,
    sparkle: true,
    armPose: 'celebrate',
  },
  sad: {
    animation: { y: [0, 3, 0], transition: { duration: 2.4, repeat: Infinity } },
    eyeExpression: 'closed',
    mouthExpression: 'frown',
    tear: true,
    armPose: 'rest',
  },
  thinking: {
    animation: { rotate: [0, -4, 4, 0], transition: { duration: 2, repeat: Infinity } },
    eyeExpression: 'focus',
    mouthExpression: 'neutral',
    thought: 'Hmm...',
    armPose: 'focus',
  },
  processing: {
    animation: {
      rotate: [-2, 2, -2],
      scale: [1, 0.98, 1],
      transition: { duration: 1.4, repeat: Infinity },
    },
    eyeExpression: 'focus',
    mouthExpression: 'neutral',
    accessory: 'clipboard',
    armPose: 'focus',
  },
  shy: {
    animation: { y: [0, 2, 0], transition: { duration: 2, repeat: Infinity } },
    eyeExpression: 'closed',
    mouthExpression: 'smile',
    cheeks: true,
    armPose: 'cover',
  },
};

const InteractiveMascot = ({
  emotion,
  size = 160,
  message,
  color = '#3b82f6',
}: InteractiveMascotProps) => {
  const config = useMemo(() => emotionConfigs[emotion] ?? emotionConfigs.idle, [emotion]);
  const eyeSize = size * 0.12;

  const renderEyes = () => {
    switch (config.eyeExpression) {
      case 'closed':
        return (
          <>
            <div className="w-8 h-1 bg-gray-700 rounded-full" />
            <div className="w-8 h-1 bg-gray-700 rounded-full" />
          </>
        );
      case 'smile':
        return (
          <>
            <div className="w-6 h-3 border-b-4 border-gray-800 rounded-full" />
            <div className="w-6 h-3 border-b-4 border-gray-800 rounded-full" />
          </>
        );
      case 'wide':
        return (
          <>
            <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-inner" />
            <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-800 shadow-inner" />
          </>
        );
      case 'focus':
        return (
          <>
            <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-800 shadow-inner flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900 translate-x-1" />
            </div>
            <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-800 shadow-inner flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-900 -translate-x-1" />
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="w-4 h-4 rounded-full bg-white shadow-inner border-2 border-gray-800" />
            <div className="w-4 h-4 rounded-full bg-white shadow-inner border-2 border-gray-800" />
          </>
        );
    }
  };

  const renderMouth = () => {
    switch (config.mouthExpression) {
      case 'bigSmile':
        return (
          <svg width="48" height="24" viewBox="0 0 48 24">
            <path d="M4 4 C 12 22, 36 22, 44 4" stroke="#1f2937" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'open':
        return (
          <svg width="32" height="24" viewBox="0 0 32 24">
            <path d="M4 8 Q 16 24 28 8" fill="#ef4444" stroke="#1f2937" strokeWidth="3" />
          </svg>
        );
      case 'frown':
        return (
          <svg width="36" height="18" viewBox="0 0 36 18">
            <path d="M4 14 Q 18 2 32 14" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'neutral':
        return <div className="w-10 h-1 bg-gray-800 rounded-full" />;
      case 'o':
        return <div className="w-5 h-5 rounded-full border-4 border-gray-800" />;
      default:
        return (
          <svg width="36" height="18" viewBox="0 0 36 18">
            <path d="M4 4 Q 18 16 32 4" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const getArmPose = (side: 'left' | 'right') => {
    const base = {
      width: size * 0.45,
      height: size * 0.12,
      backgroundColor: `${color}80`,
    };

    switch (config.armPose) {
      case 'cover':
        return {
          style: {
            ...base,
            top: size * 0.28,
            [side === 'left' ? 'left' : 'right']: -size * 0.02,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
          },
          animate: {
            rotate: side === 'left' ? -80 : 80,
            y: -size * 0.25,
          },
        };
      case 'celebrate':
        return {
          style: {
            ...base,
            top: size * 0.25,
            [side === 'left' ? 'left' : 'right']: -size * 0.05,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
          },
          animate: {
            rotate: side === 'left' ? -60 : 60,
            y: -size * 0.2,
          },
        };
      case 'focus':
        return {
          style: {
            ...base,
            top: size * 0.4,
            [side === 'left' ? 'left' : 'right']: -size * 0.05,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
          },
          animate: {
            rotate: side === 'left' ? -10 : 10,
            y: 0,
          },
        };
      default:
        return {
          style: {
            ...base,
            top: size * 0.5,
            [side === 'left' ? 'left' : 'right']: -size * 0.05,
            transformOrigin: side === 'left' ? 'left center' : 'right center',
          },
          animate: {
            rotate: side === 'left' ? 20 : -20,
            y: 0,
          },
        };
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="relative"
        style={{ width: size, height: size }}
        animate={config.animation}
      >
        {/* Body */}
        <div
          className="absolute inset-0 rounded-full shadow-2xl"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}55, ${color})`,
          }}
        />

        {/* Inner glow */}
        <div
          className="absolute inset-3 rounded-full"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.6), transparent)',
            opacity: 0.6,
          }}
        />

        {/* Arms */}
        {(['left', 'right'] as const).map((side) => {
          const pose = getArmPose(side);
          return (
            <motion.div
              key={side}
              className="absolute rounded-full opacity-80"
              style={pose.style as Record<string, number | string>}
              animate={pose.animate}
              transition={{ duration: 0.5, repeat: config.armPose === 'celebrate' ? Infinity : 0, repeatType: 'reverse' }}
            />
          );
        })}

        {/* Eyes */}
        <div
          className="absolute flex items-center justify-between z-10"
          style={{
            top: size * 0.33,
            left: '50%',
            transform: 'translateX(-50%)',
            width: size * 0.5,
            gap: size * 0.15,
          }}
        >
          <div className="flex gap-4 items-center" style={{ gap: eyeSize * 0.8 }}>
            {renderEyes()}
          </div>
        </div>

        {/* Cheeks */}
        {config.cheeks && (
          <>
            <div
              className="absolute bg-rose-300 rounded-full opacity-60"
              style={{
                width: size * 0.15,
                height: size * 0.07,
                top: size * 0.45,
                left: size * 0.2,
              }}
            />
            <div
              className="absolute bg-rose-300 rounded-full opacity-60"
              style={{
                width: size * 0.15,
                height: size * 0.07,
                top: size * 0.45,
                right: size * 0.2,
              }}
            />
          </>
        )}

        {/* Tear */}
        {config.tear && (
          <motion.div
            className="absolute w-2 h-4 bg-blue-200 rounded-b-full"
            style={{ left: size * 0.35, top: size * 0.45 }}
            animate={{ y: [0, 5, 0], opacity: [1, 0.6, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* Mouth */}
        <div
          className="absolute flex justify-center"
          style={{
            top: size * 0.55,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {renderMouth()}
        </div>

        {/* Hands covering eyes */}
        {emotion === 'shy' && (
          <>
            <motion.div
              className="absolute bg-white/90 rounded-full shadow"
              style={{
                width: size * 0.22,
                height: size * 0.12,
                top: size * 0.28,
                left: size * 0.16,
              }}
              animate={{ rotate: [-10, 5, -10] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <motion.div
              className="absolute bg-white/90 rounded-full shadow"
              style={{
                width: size * 0.22,
                height: size * 0.12,
                top: size * 0.28,
                right: size * 0.16,
              }}
              animate={{ rotate: [10, -5, 10] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </>
        )}

        {/* Sparkles */}
        {config.sparkle && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(5)].map((_, index) => (
              <motion.div
                key={index}
                className="absolute text-yellow-200 text-lg"
                style={{
                  left: `${20 + index * 12}%`,
                  top: `${index % 2 === 0 ? 5 : 15}%`,
                }}
                animate={{ scale: [0, 1, 0], rotate: [0, 180, 360] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              >
                ✨
              </motion.div>
            ))}
          </div>
        )}

        {/* Thought bubble */}
        {config.thought && (
          <motion.div
            className="absolute -top-10 -right-4 bg-white text-gray-700 text-xs px-3 py-1 rounded-2xl shadow-md"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {config.thought}
          </motion.div>
        )}

        {/* Accessory */}
        {config.accessory === 'clipboard' && (
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 border border-gray-200 rounded-xl px-4 py-2 shadow-lg text-xs text-gray-700 flex items-center gap-2"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            📄 Grading...
          </motion.div>
        )}
      </motion.div>

      {message && (
        <div className="px-4 py-2 bg-white/70 border border-gray-200 rounded-full shadow-sm text-sm text-gray-700">
          {message}
        </div>
      )}
    </div>
  );
};

export type { Emotion as MascotEmotion };
export default InteractiveMascot;

