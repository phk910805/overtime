#!/bin/bash
cd /Users/user/Documents/overtime-app
git add src/components/Dashboard.js
git commit -m "fix: 헤더 높이 통일 - 32px에서 34px로 변경

- HeaderCell과 DateHeaderCell에 minHeight: '34px' 추가
- 모든 테이블 헤더 th 요소에 minHeight 스타일 적용
- 날짜 헤더 셀의 높이 일관성 확보

변경사항:
- HeaderCell: minHeight 34px 고정
- DateHeaderCell: minHeight 34px 고정  
- 모든 th 스타일에 minHeight: '34px' 추가"
echo "Changes committed successfully"
