/**
 * HorizontalScrollContainer
 * 가로 스크롤 UX 개선 컴포넌트
 * - 스크롤 영역 + 상태 관리
 * - ScrollControlBar와 함께 사용
 */

import React, { useState, useRef, useEffect, useCallback, memo, forwardRef, useImperativeHandle } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const SCROLL_AMOUNT = 300;

// 스크롤 컨트롤 바 (분리된 컴포넌트)
export const ScrollControlBar = memo(({ scrollState, onScroll, onTrackClick, onThumbDrag, onThumbDragEnd, leftWidth = 340, showTooltip = false, onCloseTooltip }) => {
  const { canScrollLeft, canScrollRight, scrollPercent, thumbWidth } = scrollState;
  const showScrollControls = canScrollLeft || canScrollRight;
  const trackRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragEndTimeRef = useRef(0); // 드래그 종료 시간
  const [localScrollPercent, setLocalScrollPercent] = useState(scrollPercent);
  const localScrollPercentRef = useRef(scrollPercent); // ref로도 관리
  
  // 드래그 중이 아닐 때만 외부 scrollPercent와 동기화
  // 드래그 직후에는 동기화하지 않음 (위치 점프 방지)
  useEffect(() => {
    if (!isDraggingRef.current) {
      const timeSinceDragEnd = Date.now() - dragEndTimeRef.current;
      // 드래그 종료 직후 500ms 동안은 동기화하지 않음
      if (timeSinceDragEnd > 500) {
        setLocalScrollPercent(scrollPercent);
      }
    }
  }, [scrollPercent]);

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
      
      // 로컬 상태 즉시 업데이트 (부드러운 프레임)
      setLocalScrollPercent(percent);
      localScrollPercentRef.current = percent; // ref도 함께 업데이트
      
      if (onThumbDrag) {
        onThumbDrag(percent);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        dragEndTimeRef.current = Date.now();
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // 드래그 종료 콜백 호출 (localScrollPercent를 동기화하기 전에)
        if (onThumbDragEnd) {
          // 현재 localScrollPercent 값을 전달하여 실제 스크롤 위치를 고정
          onThumbDragEnd(localScrollPercentRef.current);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [thumbWidth, onThumbDrag, onThumbDragEnd]);

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
              left: `${(100 - thumbWidth) * (localScrollPercent / 100)}%`,
            }}
            onMouseDown={handleThumbMouseDown}
          />
        </div>

        {/* 좌우 버튼 */}
        <div className="flex-shrink-0 bg-gray-100 h-full flex items-center relative">
          {/* 툴팁 - 버튼 위에 표시 */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-1 bg-gray-500 text-white text-xs px-3 py-2 rounded shadow-lg flex items-center space-x-2 whitespace-nowrap z-30">
              <span>Shift + 마우스 휠로 가로 스크롤을 할 수 있습니다.</span>
              <button
                onClick={onCloseTooltip}
                className="hover:bg-gray-400 rounded p-0.5"
                aria-label="닫기"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
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
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    scrollPercent: 0,
    thumbWidth: 20,
  });
  
  // 드래그 스크롤 상태
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false); // 클릭 vs 드래그 구분
  const DRAG_THRESHOLD = 5; // 드래그로 판정하는 최소 이동 거리 (px)
  
  // thumb 드래그 상태 (ScrollControlBar에서 드래그 중일 때)
  const isThumbDraggingRef = useRef(false);
  const thumbDragEndTimeRef = useRef(0);
  
  // 관성 스크롤용 상태
  const lastMoveTimeRef = useRef(0);
  const lastMoveXRef = useRef(0);
  const velocityRef = useRef(0);
  const momentumAnimationRef = useRef(null);

  // 스크롤 가능 여부 및 위치 체크
  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // thumb 드래그 종료 직후 500ms 동안은 상태 업데이트 방지 (위치 점프 방지)
    const timeSinceThumbDragEnd = Date.now() - thumbDragEndTimeRef.current;
    if (isThumbDraggingRef.current || timeSinceThumbDragEnd < 500) {
      return;
    }

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
      
      return () => {
        clearTimeout(initTimer);
        el.removeEventListener('scroll', checkScrollability);
        window.removeEventListener('resize', checkScrollability);
      };
    }

    return () => {
      clearTimeout(initTimer);
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

  // 드래그 스크롤 핸들러
  const handleMouseDown = useCallback((e) => {
    // 버튼 클릭이면 무시
    if (e.button !== 0) return;
    
    const el = scrollRef.current;
    if (!el) return;
    
    // 기존 관성 애니메이션 중지
    if (momentumAnimationRef.current) {
      cancelAnimationFrame(momentumAnimationRef.current);
      momentumAnimationRef.current = null;
    }
    
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = el.scrollLeft;
    
    // 속도 추적 초기화
    lastMoveTimeRef.current = Date.now();
    lastMoveXRef.current = e.clientX;
    velocityRef.current = 0;
    
    // 텍스트 선택 방지
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;
    
    const el = scrollRef.current;
    if (!el) return;
    
    const deltaX = e.clientX - dragStartXRef.current;
    const now = Date.now();
    const dt = now - lastMoveTimeRef.current;
    
    // 드래그 임계값 체크
    if (Math.abs(deltaX) > DRAG_THRESHOLD) {
      hasDraggedRef.current = true;
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
    
    if (hasDraggedRef.current) {
      // 속도 계산 (픽셀/밀리초)
      if (dt > 0) {
        const dx = e.clientX - lastMoveXRef.current;
        velocityRef.current = dx / dt;
      }
      
      lastMoveTimeRef.current = now;
      lastMoveXRef.current = e.clientX;
      
      // 마우스 이동 반대 방향으로 스크롤 (자연스러운 느낌)
      el.scrollLeft = dragStartScrollLeftRef.current - deltaX;
    }
  }, [DRAG_THRESHOLD]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // thumb 드래그 중이면 관성 스크롤 실행 안 함
      if (isThumbDraggingRef.current) {
        return;
      }
      
      // 관성 스크롤 시작
      if (hasDraggedRef.current && Math.abs(velocityRef.current) > 0.1) {
        const el = scrollRef.current;
        if (!el) return;
        
        const friction = 0.9;
        const minVelocity = 0.1;
        
        const animate = () => {
          velocityRef.current *= friction;
          
          if (Math.abs(velocityRef.current) < minVelocity) {
            momentumAnimationRef.current = null;
            return;
          }
          
          el.scrollLeft -= velocityRef.current * 16;
          momentumAnimationRef.current = requestAnimationFrame(animate);
        };
        
        momentumAnimationRef.current = requestAnimationFrame(animate);
      }
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    // 컨테이너 밖으로 나가면 드래그 종료
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  }, []);

  // 드래그 중 클릭 이벤트 방지
  const handleClick = useCallback((e) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
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
      
      // thumb 드래그 중임을 표시
      isThumbDraggingRef.current = true;
      
      const { scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      const newScrollLeft = Math.round((percent / 100) * maxScroll);
      
      // scrollTo 대신 scrollLeft 직접 설정 (브라우저 반올림 방지)
      el.scrollLeft = newScrollLeft;
    },
    // thumb 드래그 종료 시 호출
    onThumbDragEnd: (finalPercent) => {
      
      // 기존 관성 애니메이션 중지
      if (momentumAnimationRef.current) {
        cancelAnimationFrame(momentumAnimationRef.current);
        momentumAnimationRef.current = null;
      }
      
      // velocity 초기화 (관성 스크롤 방지)
      velocityRef.current = 0;
      hasDraggedRef.current = false;
      isDraggingRef.current = false;
      
      const el = scrollRef.current;
      if (!el) return;
      
      // 드래그 종료 시 최종 percent로 스크롤 위치 확정
      if (finalPercent !== undefined) {
        const { scrollWidth, clientWidth } = el;
        const maxScroll = scrollWidth - clientWidth;
        const targetScrollLeft = Math.round((finalPercent / 100) * maxScroll);
        
        // 브라우저 관성 스크롤 방지: 스크롤 위치를 지속적으로 복원
        let frameCount = 0;
        const maxFrames = 10; // 약 160ms 동안 위치 고정
        
        const lockPosition = () => {
          if (frameCount < maxFrames) {
            el.scrollLeft = targetScrollLeft;
            frameCount++;
            requestAnimationFrame(lockPosition);
          } else {
            isThumbDraggingRef.current = false;
            thumbDragEndTimeRef.current = Date.now();
          }
        };
        
        el.scrollLeft = targetScrollLeft;
        requestAnimationFrame(lockPosition);
      } else {
        setTimeout(() => {
          isThumbDraggingRef.current = false;
          thumbDragEndTimeRef.current = Date.now();
        }, 50);
      }
    },
    // 직접 스크롤 위치 설정 메서드 추가 (픽셀 단위)
    scrollTo: (left, behavior = 'smooth') => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTo({ left, behavior });
    },
  }), [scroll, handleTrackClick, scrollState]);

  return (
    <div className={`relative ${className}`} style={{ minWidth: 0 }}>

      {/* 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="overflow-x-auto cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClickCapture={handleClick}
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
