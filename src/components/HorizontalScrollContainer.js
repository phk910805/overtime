/**
 * HorizontalScrollContainer
 * 가로 스크롤 UX 개선 컴포넌트
 * - 스크롤 영역 + 상태 관리
 * - ScrollControlBar와 함께 사용
 */

import React, { useState, useRef, useEffect, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const SCROLL_AMOUNT = 300;
const TOOLTIP_STORAGE_KEY = 'hideScrollTip';

// 스크롤 컨트롤 바 (분리된 컴포넌트)
export const ScrollControlBar = memo(({ scrollState, onScroll, onTrackClick, onThumbDrag, leftWidth = 340 }) => {
  const { canScrollLeft, canScrollRight, scrollPercent, thumbWidth } = scrollState;
  const showScrollControls = canScrollLeft || canScrollRight;
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);

  // 드래그 시작
  const handleThumbMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, []);

  // 드래그 중 (문서 레벨에서 처리)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !trackRef.current) return;
      
      const track = trackRef.current;
      const rect = track.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const trackWidth = rect.width;
      
      // thumb 중앙 기준으로 계산
      const thumbWidthPx = (thumbWidth / 100) * trackWidth;
      const effectiveWidth = trackWidth - thumbWidthPx;
      const adjustedX = mouseX - (thumbWidthPx / 2);
      const percent = Math.max(0, Math.min(100, (adjustedX / effectiveWidth) * 100));
      
      if (onThumbDrag) {
        onThumbDrag(percent);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [thumbWidth, onThumbDrag]);

  if (!showScrollControls) return null;

  return (
    <div className="sticky bottom-0 z-20 flex">
      {/* 왼쪽 빈 영역 (이름~구분 컨럼 너비) - 회색 배경 */}
      <div 
        className="flex-shrink-0 bg-gray-100 border-t border-gray-300" 
        style={{ width: leftWidth }}
      />

      {/* 오른쪽 스크롤바 영역 (이월~마지막날 너비) */}
      <div className="flex-1 bg-white border-t border-gray-300 flex items-center">
        {/* 스크롤바 트랙 */}
        <div
          ref={trackRef}
          className="flex-1 h-full cursor-pointer relative"
          onClick={onTrackClick}
        >
          {/* thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3 bg-gray-300 hover:bg-gray-400 active:bg-gray-400 rounded-full transition-colors cursor-grab active:cursor-grabbing"
            style={{
              width: `${thumbWidth}%`,
              left: `${(100 - thumbWidth) * (scrollPercent / 100)}%`,
            }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>

        {/* 좌우 버튼 */}
        <div className="flex-shrink-0 bg-gray-100 h-full flex items-center">
          <button
            onClick={() => onScroll('left')}
            disabled={!canScrollLeft}
            className="p-1 transition-all hover:bg-gray-200 text-gray-600"
            aria-label="왼쪽으로 스크롤"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => onScroll('right')}
            disabled={!canScrollRight}
            className="p-1 transition-all hover:bg-gray-200 text-gray-600"
            aria-label="오른쪽으로 스크롤"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
});

// 메인 스크롤 컨테이너
const HorizontalScrollContainer = forwardRef(({ children, className = '', onScrollStateChange }, ref) => {
  const scrollRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    scrollPercent: 0,
    thumbWidth: 20,
  });

  // 스크롤 가능 여부 및 위치 체크
  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const canScrollLeft = scrollLeft > 1;
    const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
    
    const maxScroll = scrollWidth - clientWidth;
    let scrollPercent = 0;
    let thumbWidth = 20;
    
    if (maxScroll > 0) {
      scrollPercent = (scrollLeft / maxScroll) * 100;
      thumbWidth = Math.max(15, (clientWidth / scrollWidth) * 100);
    }

    const newState = { canScrollLeft, canScrollRight, scrollPercent, thumbWidth };
    setScrollState(newState);
    
    if (onScrollStateChange) {
      onScrollStateChange(newState);
    }
  }, [onScrollStateChange]);

  // 초기 로드 및 리사이즈 시 체크
  useEffect(() => {
    const initTimer = setTimeout(checkScrollability, 200);
    
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }

    const hideTip = localStorage.getItem(TOOLTIP_STORAGE_KEY);
    if (!hideTip) {
      setShowTooltip(true);
    }

    return () => {
      clearTimeout(initTimer);
      if (el) {
        el.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  // children 변경 시 스크롤 상태 재확인
  useEffect(() => {
    const timer = setTimeout(checkScrollability, 300);
    return () => clearTimeout(timer);
  }, [children, checkScrollability]);

  // 스크롤 함수
  const scroll = useCallback((direction) => {
    const el = scrollRef.current;
    if (!el) return;

    const amount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  // 커스텀 스크롤바 클릭 핸들러
  const handleTrackClick = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;

    const track = e.currentTarget;
    const rect = track.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackWidth = rect.width;
    const clickPercent = (clickX / trackWidth) * 100;
    
    const { scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;
    const newScrollLeft = (clickPercent / 100) * maxScroll;
    
    el.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }, []);

  // 툴팁 닫기
  const closeTooltip = useCallback(() => {
    setShowTooltip(false);
    localStorage.setItem(TOOLTIP_STORAGE_KEY, 'true');
  }, []);

  // 부모에서 접근할 수 있도록 ref 노출
  useImperativeHandle(ref, () => ({
    scroll,
    handleTrackClick,
    scrollState,
    // 드래그로 스크롤 위치 설정 (퍼센트 기준)
    scrollToPercent: (percent) => {
      const el = scrollRef.current;
      if (!el) return;
      
      const { scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      const newScrollLeft = (percent / 100) * maxScroll;
      
      el.scrollTo({ left: newScrollLeft });
    },
  }), [scroll, handleTrackClick, scrollState]);

  const showScrollControls = scrollState.canScrollLeft || scrollState.canScrollRight;

  return (
    <div className={`relative ${className}`} style={{ minWidth: 0 }}>
      {/* Shift + 휠 안내 툴팁 */}
      {showTooltip && showScrollControls && (
        <div className="absolute top-0 right-0 z-30">
          <div className="bg-blue-600 text-white text-xs px-3 py-2 rounded-bl-lg shadow-lg flex items-center space-x-2">
            <span>💡 Shift + 마우스 휠로 가로 스크롤</span>
            <button
              onClick={closeTooltip}
              className="hover:bg-blue-700 rounded p-0.5"
              aria-label="닫기"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style>{`
          div[class*="overflow-x-auto"]::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {children}
      </div>
    </div>
  );
});

export default HorizontalScrollContainer;
