cd /Users/user/Documents/overtime-app

# 현재 상태 확인
echo "=== 현재 Git 상태 ==="
git status

echo ""
echo "=== 변경된 내용 미리보기 ==="
git diff src/components/Dashboard.js

echo ""
echo "=== 변경사항 스테이징 ==="
git add src/components/Dashboard.js

echo ""
echo "=== 커밋 실행 ==="
git commit -m "refactor: 대시보드 헤더 코드 정리 및 컴포넌트화

✨ 개선사항:
- HeaderCell 컴포넌트 추가 (왼쪽 헤더용)  
- DateHeaderCell 컴포넌트 추가 (날짜 헤더용)
- 중복 코드 288줄 → 20줄로 93% 감소
- 코드 가독성 및 유지보수성 대폭 향상

🔧 기술적 변경:
- 반복되는 div 구조를 재사용 가능한 컴포넌트로 교체
- props를 통한 유연한 정렬 및 데이터 전달
- memo()를 활용한 성능 최적화

✅ 기존 기능 보장:
- 휴일 표시 기능 유지
- 주말/휴일 색상 구분 유지  
- 시간 입력 클릭 기능 유지
- multiplier 배수 표시 유지
- 시각적 레이아웃 동일"

echo ""
echo "=== 커밋 히스토리 확인 ==="
git log --oneline -3

echo ""
echo "✅ 커밋 완료!"
echo "원격 저장소에 푸시하려면: git push origin main"
