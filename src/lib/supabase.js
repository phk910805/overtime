import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

// Supabase 클라이언트 생성 (환경변수가 있을 때만)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  if (!supabase) {
    console.log('Supabase 환경변수가 설정되지 않음')
    return false
  }

  try {
    const { error } = await supabase
      .from('employees')
      .select('count', { count: 'exact', head: true })
    
    if (error) throw error
    
    console.log('✅ Supabase 연결 성공')
    return true
  } catch (error) {
    console.error('❌ Supabase 연결 실패:', error.message)
    return false
  }
}