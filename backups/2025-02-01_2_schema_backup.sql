-- ================================================================
-- Supabase 스키마 백업 SQL
-- ================================================================
-- 백업 일시: 2025-02-01
-- 프로젝트: overtime-management
-- 목적: 테이블 구조, 인덱스, 제약조건 백업
-- ================================================================

-- ================================================================
-- Step 1: 모든 테이블 구조 확인
-- ================================================================

SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    c.ordinal_position
FROM 
    information_schema.tables t
    JOIN information_schema.columns c 
        ON t.table_name = c.table_name
WHERE 
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
ORDER BY 
    t.table_name, 
    c.ordinal_position;

-- 결과를 텍스트 파일로 저장: schema_columns_2025-02-01.txt

-- ================================================================
-- Step 2: Primary Key 확인
-- ================================================================

SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
WHERE 
    tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
ORDER BY
    tc.table_name;

-- ================================================================
-- Step 3: Foreign Key 관계 확인
-- ================================================================

SELECT
    tc.table_name AS from_table,
    kcu.column_name AS from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
WHERE 
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY
    tc.table_name;

-- ================================================================
-- Step 4: 인덱스 확인
-- ================================================================

SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    schemaname = 'public'
ORDER BY
    tablename,
    indexname;

-- ================================================================
-- Step 5: Unique 제약조건 확인
-- ================================================================

SELECT
    tc.table_name,
    kcu.column_name,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
WHERE 
    tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
ORDER BY
    tc.table_name,
    kcu.column_name;

-- ================================================================
-- Step 6: Check 제약조건 확인
-- ================================================================

SELECT
    tc.table_name,
    cc.check_clause,
    tc.constraint_name
FROM 
    information_schema.table_constraints AS tc
    JOIN information_schema.check_constraints AS cc
        ON tc.constraint_name = cc.constraint_name
WHERE 
    tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
ORDER BY
    tc.table_name;

-- ================================================================
-- Step 7: 시퀀스 확인
-- ================================================================

SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM 
    information_schema.sequences
WHERE 
    sequence_schema = 'public'
ORDER BY
    sequence_name;

-- ================================================================
-- Step 8: 테이블 DDL 생성 (참고용)
-- ================================================================

-- 주의: 이 부분은 Supabase SQL Editor에서 직접 확인 필요
-- pg_dump 도구가 필요하므로 로컬 환경에서 실행

-- 로컬 터미널에서 실행 (PostgreSQL 클라이언트 필요):
-- pg_dump "postgresql://postgres:[PASSWORD]@db.qcsvkxtxtdljphyyrwcg.supabase.co:5432/postgres" \
--   --schema-only \
--   --no-owner \
--   --no-privileges \
--   > schema_ddl_2025-02-01.sql

-- ================================================================
-- 백업 완료 체크리스트
-- ================================================================
-- 
-- □ Step 1: 테이블 구조 확인 및 저장
-- □ Step 2: Primary Key 저장
-- □ Step 3: Foreign Key 저장
-- □ Step 4: 인덱스 저장
-- □ Step 5: Unique 제약조건 저장
-- □ Step 6: Check 제약조건 저장
-- □ Step 7: 시퀀스 저장
-- 
-- ✅ 스키마 백업 완료!
-- ================================================================
