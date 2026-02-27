/**
 * LandingPage.js
 * 서비스 소개 랜딩 페이지 — 비로그인 사용자의 기본 진입점
 */

import React, { memo, useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, BarChart3, Users, Shield, ArrowRight, CheckCircle, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: Clock,
    title: '실시간 근무시간 추적',
    description: '직원별 초과근무 현황을 한눈에 파악하고, 월별 누적 데이터를 자동으로 관리합니다.',
  },
  {
    icon: BarChart3,
    title: '대시보드 & 리포트',
    description: '부서별, 직원별 초과근무 통계를 시각적으로 분석하여 인력 운영을 최적화합니다.',
  },
  {
    icon: Users,
    title: '팀 단위 관리',
    description: '직원 등록부터 승인 처리까지, 조직 구조에 맞는 체계적인 관리 워크플로우를 제공합니다.',
  },
  {
    icon: Shield,
    title: '승인 & 알림 시스템',
    description: '초과근무 신청-승인 프로세스를 디지털화하고, 실시간 알림으로 빠르게 처리합니다.',
  },
];

const LandingPage = memo(() => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const goSignup = useCallback(() => navigate('/signup'), [navigate]);
  const goLogin = useCallback(() => navigate('/login'), [navigate]);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Animations */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .landing-gradient { animation: gradient-shift 8s ease infinite; background-size: 200% 200%; }
        .landing-float { animation: float-up 6s ease-in-out infinite; }
        .landing-float-delay { animation: float-up 6s ease-in-out 2s infinite; }
      `}</style>

      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">오버타임</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={goLogin}
              className="text-slate-300 hover:text-white px-4 py-2 text-sm font-medium transition-colors"
            >
              로그인
            </button>
            <button
              onClick={goSignup}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              시작하기
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden">
        {/* Animated gradient */}
        <div
          className="absolute inset-0 landing-gradient opacity-60"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 25%, #0f172a 50%, #172554 75%, #0f172a 100%)',
          }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Decorative orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl landing-float" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl landing-float-delay" />

        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-blue-300 text-sm mb-10 transition-all duration-700 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <Zap className="w-3.5 h-3.5" />
            스마트한 근무시간 관리의 시작
          </div>

          {/* Headline */}
          <h1
            className={`text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight tracking-tight mb-8 transition-all duration-700 delay-100 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            초과근무 관리,
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #22d3ee 50%, #34d399 100%)' }}
            >
              더 쉽고 정확하게
            </span>
          </h1>

          {/* Subtext */}
          <p
            className={`text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed transition-all duration-700 delay-200 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            엑셀과 수기 관리에서 벗어나세요.
            <br className="hidden sm:block" />
            근무시간 기록부터 승인, 통계까지 — 하나의 플랫폼에서 완결합니다.
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ease-out ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <button
              onClick={goSignup}
              className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-400/30"
            >
              무료로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            <button
              onClick={goLogin}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white font-semibold rounded-xl text-lg transition-all duration-200 border"
              style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              로그인
            </button>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-24 md:py-32 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 tracking-tight">
              근무시간 관리에 필요한 모든 것
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
              복잡한 초과근무 관리를 단순하고 효율적으로 바꿔드립니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center transition-colors duration-300">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                      <p className="text-slate-500 leading-relaxed text-sm">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="relative py-24 md:py-32 px-6 bg-slate-900 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
            지금 바로 시작하세요
          </h2>
          <p className="text-slate-400 text-lg mb-10 leading-relaxed">
            가입 즉시 모든 기능을 무료로 사용할 수 있습니다.
            <br />
            설정은 5분이면 충분합니다.
          </p>
          <button
            onClick={goSignup}
            className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-lg transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-400/30"
          >
            무료로 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-8 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              무료 사용
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              카드 등록 불필요
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              5분 내 설정 완료
            </span>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-6 bg-slate-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500/80 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-slate-500 text-sm font-medium">오버타임</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <Link to="/terms" className="text-slate-500 hover:text-slate-300 transition-colors">이용약관</Link>
            <span className="text-slate-700">|</span>
            <Link to="/privacy" className="text-slate-500 hover:text-slate-300 transition-colors">개인정보 처리방침</Link>
          </div>
          <p className="text-slate-600 text-xs">
            © 2026 초과근무시간 관리 시스템
          </p>
        </div>
      </footer>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
