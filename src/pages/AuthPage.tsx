import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthMutation, useRegisterMutation } from '../api/hooks';
import useAuthStore from '../store/useAuthStore';
import Mascot from '../components/Mascot';
import ParticleBackground from '../components/ParticleBackground';

const AuthPage = () => {
  const { user, setAuth } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mascotEmotion, setMascotEmotion] = useState<'happy' | 'thinking' | 'excited' | 'confused' | 'sad' | 'celebrating'>('happy');

  const loginMutation = useAuthMutation();
  const registerMutation = useRegisterMutation();

  // Redirect if already logged in
  if (user) {
    window.location.href = '/dashboard';
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      setMascotEmotion('sad');
      setTimeout(() => setMascotEmotion('confused'), 500);
      return;
    }

    setMascotEmotion('excited');

    if (isLogin) {
      console.log('Login attempt:', { email, password });
      loginMutation.mutate({ email, password }, {
        onSuccess: (payload) => {
          console.log('Login success:', payload);
          setMascotEmotion('celebrating');
          setTimeout(() => setAuth(payload), 1000);
        },
        onError: (error) => {
          console.log('Login error:', error);
          setMascotEmotion('sad');
          setTimeout(() => setMascotEmotion('confused'), 500);
        }
      });
    } else {
      console.log('Register attempt:', { email, password, name });
      registerMutation.mutate({ email, password, name }, {
        onSuccess: (payload) => {
          console.log('Register success:', payload);
          setMascotEmotion('celebrating');
          setTimeout(() => setAuth(payload), 1000);
        },
        onError: (error) => {
          console.log('Register error:', error);
          setMascotEmotion('sad');
          setTimeout(() => setMascotEmotion('confused'), 500);
        }
      });
    }
  };

  const toggleMode = () => {
    setMascotEmotion('thinking');
    setIsLogin(!isLogin);
    setTimeout(() => setMascotEmotion('happy'), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-20 animate-bounce">📚</div>
        <div className="absolute top-40 right-20 text-5xl opacity-20 animate-pulse">🧠</div>
        <div className="absolute bottom-32 left-20 text-4xl opacity-20 animate-spin">✨</div>
        <div className="absolute bottom-20 right-32 text-5xl opacity-20 animate-ping">🎯</div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Mascot */}
        <div className="text-center mb-8">
          <Mascot
            emotion={mascotEmotion}
            color="#3b82f6"
            size={120}
          />
          <h1 className="text-4xl font-bold text-white mt-4 mb-2">Lumos IELTS</h1>
          <p className="text-lg text-white/80">
            {mascotEmotion === 'happy' && "Ready to learn English with me? 🎓"}
            {mascotEmotion === 'thinking' && "Let me think about this... 🤔"}
            {mascotEmotion === 'excited' && "Yay! Let's get started! 🚀"}
            {mascotEmotion === 'confused' && "Hmm, something's not right... 😕"}
            {mascotEmotion === 'celebrating' && "Welcome aboard! 🎉"}
            {mascotEmotion === 'sad' && "Oh no! Let's try again! 💪"}
          </p>
        </div>

        {/* Auth Form */}
        <form
          className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl"
          onSubmit={handleSubmit}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {isLogin ? 'Welcome Back!' : 'Join Our Learning Adventure'}
            </h2>
            <p className="text-white/70 text-sm">
              {isLogin ? 'Sign in to continue your IELTS journey' : 'Create your account and start learning'}
            </p>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                placeholder="Your password"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50"
                  placeholder="Confirm your password"
                  required={!isLogin}
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <motion.p
                    className="text-red-300 text-xs mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Passwords don't match
                  </motion.p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-white text-blue-600 font-semibold rounded-xl mt-6 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {(loginMutation.isPending || registerMutation.isPending) ? (
              <>
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isLogin ? '🚀 Sign In' : '🎯 Get Started'}
              </>
            )}
          </button>

          {(loginMutation.error || registerMutation.error) && (
            <motion.div
              className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-red-300 text-sm text-center">
                {(() => {
                  const error = loginMutation.error || registerMutation.error;
                  const detail = (error as any)?.response?.data?.detail;

                  // Handle validation errors (array)
                  if (Array.isArray(detail)) {
                    return detail.map((err: any, index: number) =>
                      `${err.msg || err.message}${index < detail.length - 1 ? ', ' : ''}`
                    ).join('');
                  }

                  // Handle string errors
                  if (typeof detail === 'string') {
                    return detail;
                  }

                  return 'Something went wrong. Please try again.';
                })()}
              </p>
            </motion.div>
          )}

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={toggleMode}
              className="text-white/70 hover:text-white transition-colors text-sm underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center mt-8 text-white/50 text-sm">
          <p>✨ Learn smarter, not harder ✨</p>
          <p className="mt-1">Powered by AI • Made with ❤️</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
