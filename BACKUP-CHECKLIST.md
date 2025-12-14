# Multi-tenancy 구현 전 백업 체크리스트

## 📅 백업 일시
2024-12-14

## ✅ 백업 항목

### 1. 로컬 코드 (Git)
- [ ] 현재 변경사항 모두 커밋
- [ ] GitHub에 푸시
- [ ] 백업 브랜치 생성 (선택)

**실행 명령어:**
```bash
cd /Users/user/Desktop/overtime-app
bash backup-before-multitenancy.sh
git push origin main
```

### 2. Supabase Database
- [ ] Supabase Dashboard에서 수동 백업 생성
- [ ] 백업 이름: `before-multi-tenancy-2024-12-14`
- [ ] 백업 완료 확인

**백업 위치:**
- URL: https://app.supabase.com/project/qcsvkxtxtdljphyyrwcg/database/backups

### 3. 환경 변수
- [ ] .env.local 백업
- [ ] .env.production 백업

**백업 위치:**
- `/Users/user/Desktop/overtime-app/backups/`

### 4. 현재 DB 상태 스냅샷
- [ ] 테이블 목록 저장
- [ ] 레코드 수 저장
- [ ] 스키마 구조 저장

**SQL 실행:**
```sql
-- Supabase SQL Editor에서 실행
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
```

---

## 🔄 롤백 준비

### 롤백 시나리오 1: 코드만 복원
```bash
bash rollback-multitenancy.sh
```

### 롤백 시나리오 2: DB도 복원
1. 코드 롤백 (위와 동일)
2. Supabase Dashboard → Backups → Restore

### 롤백 시나리오 3: 완전 초기화
```bash
git reset --hard <백업_커밋_해시>
git push origin main --force
```

---

## 📊 작업 전 상태 기록

### 현재 테이블 구조
```
✅ 기존 테이블 (8개)
- employees
- overtime_records
- vacation_records
- carryover_records
- settings
- settings_history
- employee_changes
- profiles

❌ 추가될 테이블 (2개)
- companies
- company_invites
```

### company 관련 필드 현황
```
profiles:
  ✅ company_name (사용 안 함)
  ✅ business_number (사용 안 함)
  ✅ user_id (PK)
  ❌ company_id (추가 예정)

employees:
  ✅ company_name (저장만 함)
  ✅ business_number (저장만 함)
  ✅ user_id
  ❌ company_id (추가 예정)

settings:
  ❌ user_id (없음 - 문제!)
  ❌ company_id (추가 예정)
```

---

## 🎯 작업 계획

### Phase 1: DB 스키마 (1일)
- [ ] companies 테이블 생성
- [ ] company_invites 테이블 생성
- [ ] 모든 테이블에 company_id 추가
- [ ] 인덱스 생성

### Phase 2: 데이터 마이그레이션 (1일)
- [ ] 기존 테스트 데이터 정리
- [ ] 5개 회사 생성
- [ ] 테스트 직원 데이터 입력

### Phase 3: 백엔드 코드 (2일)
- [ ] supabaseAdapter.js 수정
- [ ] 초대 이메일 시스템 구현
- [ ] RLS 정책 적용

### Phase 4: 프론트엔드 UI (2일)
- [ ] CompanySetup 컴포넌트
- [ ] InviteTeamMember 컴포넌트
- [ ] Settings 페이지 수정

### Phase 5: 테스트 (2일)
- [ ] 회사별 데이터 격리 확인
- [ ] 초대 시스템 테스트
- [ ] 기존 기능 정상 작동 확인

---

## 📌 중요 체크포인트

### 작업 시작 전
- [x] 백업 스크립트 준비 완료
- [ ] Git 커밋 완료
- [ ] Supabase 백업 완료
- [ ] 롤백 스크립트 테스트

### 작업 중
- [ ] 각 단계마다 Git 커밋
- [ ] SQL 실행 전 백업 확인
- [ ] 변경사항 문서화

### 작업 완료 후
- [ ] 전체 기능 테스트
- [ ] 성능 확인
- [ ] 문서 업데이트
- [ ] GitHub 최종 푸시

---

## 🆘 문제 발생 시

1. **즉시 작업 중단**
2. **롤백 스크립트 실행**
   ```bash
   bash rollback-multitenancy.sh
   ```
3. **에러 로그 저장**
4. **문제 분석 후 재시도**

---

## 📞 연락처 및 리소스

- Supabase Dashboard: https://app.supabase.com
- GitHub Repo: (저장소 URL)
- 백업 위치: `/Users/user/Desktop/overtime-app/backups/`

---

**작성일:** 2024-12-14  
**작성자:** Claude  
**버전:** 1.0  
