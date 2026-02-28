/**
 * LandingPage.js
 * 서비스 소개 랜딩 페이지 — 비로그인 사용자의 기본 진입점
 */

import React, { memo, useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock, BarChart3, Users, Shield, ArrowRight, CheckCircle, Zap,
  Search, Download, CalendarDays, Bell, UserPlus, ClipboardList, Filter, History,
} from 'lucide-react';

/* ─── Feature Showcase Data ─── */
const SHOWCASE = [
  {
    badge: '대시보드',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-200',
    title: '전 직원의 근무현황을\n한 화면에서 파악하세요',
    description: '월별 캘린더 뷰에서 직원별 초과근무·휴가 사용시간을 실시간으로 확인합니다. 이월 시간, 잔여 시간까지 자동 계산되어 별도의 엑셀 작업이 필요 없습니다.',
    image: '/screenshots/dashboard.png',
    bullets: [
      { icon: CalendarDays, text: '월별 캘린더 뷰로 일별 시간 확인' },
      { icon: Search, text: '이름·부서로 빠른 검색 및 필터링' },
      { icon: Download, text: 'CSV 내보내기로 급여 연동' },
    ],
  },
  {
    badge: '승인 관리',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    title: '신청부터 승인까지,\n클릭 한 번으로 처리',
    description: '구성원이 제출한 초과근무·휴가전환 신청을 대기·승인·반려 상태별로 한눈에 볼 수 있습니다. 자동 승인 설정으로 반복 작업을 줄이세요.',
    image: '/screenshots/approval.png',
    bullets: [
      { icon: Shield, text: '대기·승인·반려 현황 대시보드' },
      { icon: Bell, text: '실시간 알림으로 빠른 처리' },
      { icon: ClipboardList, text: '자동 승인 설정 지원' },
    ],
  },
  {
    badge: '구성원 관리',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-200',
    title: '팀 구성을 체계적으로\n등록하고 관리하세요',
    description: '직원 정보를 등록·수정하고, 계정과 연결하여 각자의 근무시간을 직접 제출할 수 있게 합니다. 여러 명 일괄 추가와 관리 이력 추적까지 지원합니다.',
    image: '/screenshots/members.png',
    bullets: [
      { icon: UserPlus, text: '개별 추가 및 여러 명 일괄 등록' },
      { icon: Users, text: '부서별 관리 및 계정 연결' },
      { icon: History, text: '모든 변경 이력 자동 기록' },
    ],
  },
  {
    badge: '히스토리',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-200',
    title: '모든 변경 기록을\n투명하게 추적합니다',
    description: '누가, 언제, 어떤 시간을 생성·수정했는지 전체 이력을 확인할 수 있습니다. 초과근무와 휴가전환 기록을 분리하여 관리하고, 날짜 필터로 원하는 기간만 조회하세요.',
    image: '/screenshots/history.png',
    bullets: [
      { icon: Filter, text: '날짜 범위 필터 및 정렬' },
      { icon: BarChart3, text: '초과근무·휴가전환 기록 분리' },
      { icon: ClipboardList, text: '생성·수정 동작 구분 표시' },
    ],
  },
];

/* ─── Intersection Observer Hook ─── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return [ref, visible];
}

/* ─── Feature Section Component ─── */
const FeatureSection = memo(({ feature, index }) => {
  const [ref, visible] = useReveal();
  const isReversed = index % 2 === 1;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-center`}>
        {/* Screenshot */}
        <div className="w-full lg:w-3/5 flex-shrink-0">
          <div
            className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl shadow-slate-900/8"
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, transparent 20%, transparent 80%, rgba(248,250,252,0.3) 100%)',
              }}
            />
            <img
              src={feature.image}
              alt={feature.badge}
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>
        </div>

        {/* Text Content */}
        <div className="w-full lg:w-2/5">
          {/* Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border mb-5 ${feature.badgeColor}`}>
            {feature.badge}
          </span>

          {/* Title */}
          <h3
            className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug tracking-tight mb-4"
            style={{ whiteSpace: 'pre-line' }}
          >
            {feature.title}
          </h3>

          {/* Description */}
          <p className="text-slate-500 leading-relaxed mb-8 text-sm sm:text-base">
            {feature.description}
          </p>

          {/* Bullet Points */}
          <div className="space-y-3.5">
            {feature.bullets.map((bullet, i) => {
              const BulletIcon = bullet.icon;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <BulletIcon className="w-4 h-4 text-slate-600" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{bullet.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});
FeatureSection.displayName = 'FeatureSection';

/* ─── Main Landing Page ─── */
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

      {/* ─── Feature Showcase ─── */}
      <section className="py-20 md:py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20 md:mb-28">
            <p className="text-blue-600 font-semibold text-sm tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-5 tracking-tight">
              근무시간 관리에 필요한 모든 것
            </h2>
            <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
              복잡한 초과근무 관리를 단순하고 효율적으로 바꿔드립니다.
            </p>
          </div>

          {/* Feature Sections */}
          <div className="space-y-24 md:space-y-36">
            {SHOWCASE.map((feature, i) => (
              <FeatureSection key={i} feature={feature} index={i} />
            ))}
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
      <footer className="py-10 px-6 bg-slate-950 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* 상단: 로고 + 링크 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
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
          </div>

          {/* 사업자 정보 */}
          <div className="border-t border-white/5 pt-6">
            <div className="text-xs text-slate-600 leading-relaxed text-center sm:text-left space-y-1">
              <p>
                <span className="text-slate-500">상호:</span> 오버타임
                <span className="mx-2 text-slate-700">|</span>
                <span className="text-slate-500">대표:</span> 홍길동
                <span className="mx-2 text-slate-700">|</span>
                <span className="text-slate-500">사업자등록번호:</span> 000-00-00000
              </p>
              <p>
                <span className="text-slate-500">통신판매업 신고번호:</span> 제0000-서울강남-0000호
                <span className="mx-2 text-slate-700">|</span>
                <span className="text-slate-500">이메일:</span> contact@overtime.co.kr
              </p>
              <p>
                <span className="text-slate-500">주소:</span> 서울특별시 강남구 테헤란로 00길 00, 0층
              </p>
              <p className="pt-2 text-slate-700">
                © 2026 오버타임. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';

export default LandingPage;
