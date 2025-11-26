import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../store/useThemeStore';

const CustomizationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    theme,
    setTheme,
    primaryColor,
    secondaryColor,
    backgroundColor,
    accentColor,
    fontSize,
    animations,
    mascotEnabled,
    particlesEnabled,
    sidebarCollapsed,
    layout,
    updateSettings,
    resetToDefault
  } = useThemeStore();

  const themeOptions = [
    { id: 'default', name: 'Default', color: '#3b82f6', emoji: '🌟' },
    { id: 'sunset', name: 'Sunset', color: '#f59e0b', emoji: '🌅' },
    { id: 'forest', name: 'Forest', color: '#10b981', emoji: '🌲' },
    { id: 'ocean', name: 'Ocean', color: '#06b6d4', emoji: '🌊' },
  ];

  const fontSizeOptions = [
    { id: 'small', name: 'Small', size: 'text-sm' },
    { id: 'medium', name: 'Medium', size: 'text-base' },
    { id: 'large', name: 'Large', size: 'text-lg' },
  ];

  const layoutOptions = [
    { id: 'compact', name: 'Compact', desc: 'Tighter spacing' },
    { id: 'default', name: 'Default', desc: 'Balanced layout' },
    { id: 'spacious', name: 'Spacious', desc: 'More breathing room' },
  ];

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border border-slate-600"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-xl"
        >
          ⚙️
        </motion.span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-20 right-6 z-40 bg-slate-900/95 backdrop-blur-lg rounded-2xl border border-slate-700 shadow-2xl p-6 min-w-80 max-w-md"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Customize Your Experience</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {/* Theme Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  🎨 Theme
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {themeOptions.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => setTheme(option.id as any)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
                        theme === option.id
                          ? 'border-white bg-white/10 text-white'
                          : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-lg">{option.emoji}</span>
                      <div>
                        <div className="text-sm font-medium">{option.name}</div>
                        <div
                          className="w-4 h-1 rounded-full mt-1"
                          style={{ backgroundColor: option.color }}
                        />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  📝 Font Size
                </label>
                <div className="flex gap-2">
                  {fontSizeOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => updateSettings({ fontSize: option.id as any })}
                      className={`flex-1 py-2 px-3 rounded-lg border transition-all duration-200 ${
                        fontSize === option.id
                          ? 'border-white bg-white/10 text-white'
                          : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                      } ${option.size}`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  📐 Layout
                </label>
                <div className="space-y-2">
                  {layoutOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => updateSettings({ layout: option.id as any })}
                      className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                        layout === option.id
                          ? 'border-white bg-white/10 text-white'
                          : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.name}</div>
                      <div className="text-xs opacity-70">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  ⚡ Features
                </label>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Animations</span>
                  <button
                    onClick={() => updateSettings({ animations: !animations })}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      animations ? 'bg-blue-500' : 'bg-slate-600'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: animations ? 18 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Mascot</span>
                  <button
                    onClick={() => updateSettings({ mascotEnabled: !mascotEnabled })}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      mascotEnabled ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: mascotEnabled ? 18 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Particles</span>
                  <button
                    onClick={() => updateSettings({ particlesEnabled: !particlesEnabled })}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      particlesEnabled ? 'bg-purple-500' : 'bg-slate-600'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: particlesEnabled ? 18 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Compact Sidebar</span>
                  <button
                    onClick={() => updateSettings({ sidebarCollapsed: !sidebarCollapsed })}
                    className={`w-12 h-6 rounded-full transition-all duration-200 ${
                      sidebarCollapsed ? 'bg-orange-500' : 'bg-slate-600'
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      animate={{ x: sidebarCollapsed ? 18 : 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <motion.button
                onClick={resetToDefault}
                className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors duration-200 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🔄 Reset to Default
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomizationPanel;




