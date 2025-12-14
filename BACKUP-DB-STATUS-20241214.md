# DB 백업 상태 스냅샷

## 백업 일시
2024-12-14

## 현재 테이블 목록 (8개)

```json
[
  {
    "schemaname": "public",
    "tablename": "carryover_records",
    "exists": 1
  },
  {
    "schemaname": "public",
    "tablename": "employee_changes",
    "exists": 1
  },
  {
    "schemaname": "public",
    "tablename": "employees",
    "exists": 1
  },
  {
    "schemaname": "public",
    "tablename": "overtime_records",
    "exists": 1
  },
  {
    "schemaname": "public",
    "tablename": "profiles",
    "exists": 1
  },
  {
    "schemaname": "public",
    "tablename": "settings",
    "exists": 1
  },
  {
    "schemaname": "public",
    "tablename": "settings_history",
    "exists": 1
  },
  {
    "schemaname": "public",
    "tablename": "vacation_records",
    "exists": 1
  }
]
```

## Multi-tenancy 작업 후 추가될 테이블

- [ ] companies
- [ ] company_invites

## Multi-tenancy 작업 후 추가될 컬럼

모든 테이블에 `company_id INTEGER REFERENCES companies(id)` 추가:
- [ ] profiles.company_id
- [ ] employees.company_id
- [ ] overtime_records.company_id
- [ ] vacation_records.company_id
- [ ] carryover_records.company_id
- [ ] settings.company_id
- [ ] settings_history.company_id
- [ ] employee_changes.company_id

## 백업 방법

### Supabase Dashboard 백업
1. https://app.supabase.com/project/qcsvkxtxtdljphyyrwcg/database/backups
2. [Create Backup] 버튼 클릭
3. Name: `before-multi-tenancy-2024-12-14`

### 롤백 방법
1. Supabase Dashboard → Backups
2. 해당 백업 선택
3. [Restore] 버튼 클릭

---

**작성일:** 2024-12-14  
**작업:** Multi-tenancy 구현 전 상태 스냅샷
