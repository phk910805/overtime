#!/bin/bash

# 현재 변경사항 확인
echo "=== 변경사항 확인 ==="
git status

echo ""
echo "=== 변경된 파일 내용 확인 ==="
git diff

echo ""
echo "커밋을 진행하시겠습니까? (y/N)"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo ""
    echo "=== 커밋 진행 ==="
    
    # 변경사항 스테이징
    git add src/components/Dashboard.js
    
    # 커밋 메시지와 함께 커밋
    git commit -m "refactor: 대시보드 헤더 코드 정리 및 컴포넌트화

- HeaderCell 컴포넌트 추가 (왼쪽 헤더용)
- DateHeaderCell 컴포넌트 추가 (날짜 헤더용)
- 중복 코드 288줄 → 20줄로 93% 감소
- 모든 기존 기능 유지 (휴일표시, 색상, 시간입력)
- 유지보수성 및 가독성 향상"
    
    echo ""
    echo "=== 커밋 완료 ==="
    git log --oneline -5
    
    echo ""
    echo "원격 저장소에 푸시하시겠습니까? (y/N)"
    read -r push_response
    
    if [[ "$push_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo ""
        echo "=== 푸시 진행 ==="
        git push origin main
        echo "푸시 완료!"
    else
        echo "푸시를 건너뛰었습니다. 나중에 'git push origin main'으로 푸시할 수 있습니다."
    fi
else
    echo "커밋을 취소했습니다."
fi
