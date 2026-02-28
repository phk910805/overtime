// supabase/functions/withdraw-member/index.ts
// Supabase Edge Function: 구성원 탈퇴 시 Auth 계정 삭제
//
// 환경변수 (Supabase Secrets):
//   SUPABASE_SERVICE_ROLE_KEY — 자동 제공 (Supabase Edge Function 환경)
//   SUPABASE_URL — 자동 제공
//
// 배포 방법:
//   1. Supabase Dashboard > Edge Functions > 새 함수 생성
//   2. 함수 이름: withdraw-member
//   3. 이 파일 내용 붙여넣기

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. 호출자 인증 검증 (Authorization 헤더의 JWT)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // 호출자의 JWT로 anon 클라이언트 생성 → 호출자 정보 확인
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
      error: callerError,
    } = await callerClient.auth.getUser();
    if (callerError || !caller) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 2. 호출자가 owner/admin인지 확인
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, company_id")
      .eq("id", caller.id)
      .single();

    if (profileError || !callerProfile) {
      return new Response(
        JSON.stringify({ error: "Caller profile not found" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (callerProfile.role !== "owner" && callerProfile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Only owner or admin can withdraw members" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 3. 요청 바디에서 memberId 추출
    const { memberId } = await req.json();
    if (!memberId) {
      return new Response(
        JSON.stringify({ error: "memberId is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 4. 대상이 같은 회사 소속인지 확인
    const { data: memberProfile, error: memberError } = await adminClient
      .from("profiles")
      .select("role, company_id")
      .eq("id", memberId)
      .single();

    if (memberError || !memberProfile) {
      return new Response(
        JSON.stringify({ error: "Member not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (memberProfile.company_id !== callerProfile.company_id) {
      return new Response(
        JSON.stringify({ error: "Member is not in your company" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 소유자는 탈퇴 불가
    if (memberProfile.role === "owner") {
      return new Response(
        JSON.stringify({ error: "Cannot withdraw owner" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 5. Auth 계정 삭제 (service_role 권한)
    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(memberId);

    if (deleteError) {
      console.error("Auth delete failed:", deleteError);
      return new Response(
        JSON.stringify({
          error: `Auth 삭제 실패: ${deleteError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Auth account deleted" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("withdraw-member error:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
