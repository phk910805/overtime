// supabase/functions/send-invite-email/index.ts
// Supabase Edge Function: Resend API로 초대 이메일 발송
//
// 환경변수 (Supabase Secrets):
//   RESEND_API_KEY — Resend API 키
//
// 배포 방법:
//   1. Supabase Dashboard > Edge Functions > 새 함수 생성
//   2. 함수 이름: send-invite-email
//   3. 이 파일 내용 붙여넣기
//   4. Supabase Dashboard > Settings > Edge Functions > Secrets > RESEND_API_KEY 추가

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailTarget {
  email: string;
  employeeName: string;
}

interface RequestBody {
  emails: EmailTarget[];
  inviteUrl: string;
  companyName: string;
}

interface SendResult {
  email: string;
  success: boolean;
  error?: string;
}

function buildEmailHtml(employeeName: string, companyName: string, inviteUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color:#2563eb; padding:24px 32px;">
              <h1 style="margin:0; color:#ffffff; font-size:18px; font-weight:600;">초과근무 관리 시스템</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px; color:#111827; font-size:15px; line-height:1.6;">
                안녕하세요, <strong>${employeeName}</strong>님
              </p>
              <p style="margin:0 0 24px; color:#374151; font-size:14px; line-height:1.6;">
                <strong>${companyName}</strong>에서 초과근무 관리 시스템에 초대합니다.<br/>
                아래 버튼을 클릭하여 참여하세요.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <a href="${inviteUrl}" target="_blank"
                       style="display:inline-block; background-color:#2563eb; color:#ffffff; text-decoration:none; padding:12px 32px; border-radius:8px; font-size:15px; font-weight:600;">
                      참여하기
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0; color:#9ca3af; font-size:12px; line-height:1.5;">
                이 링크는 <strong>1시간 후 만료</strong>됩니다.<br/>
                본인이 요청하지 않은 경우 이 이메일을 무시하셔도 됩니다.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb; padding:16px 32px; border-top:1px solid #e5e7eb;">
              <p style="margin:0; color:#9ca3af; font-size:11px; text-align:center;">
                이 이메일은 초과근무 관리 시스템에서 자동 발송되었습니다.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestBody = await req.json();
    const { emails, inviteUrl, companyName } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(
        JSON.stringify({ error: "emails array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!inviteUrl || !companyName) {
      return new Response(
        JSON.stringify({ error: "inviteUrl and companyName are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: SendResult[] = [];

    for (const target of emails) {
      try {
        const html = buildEmailHtml(target.employeeName, companyName, inviteUrl);

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "초과근무 관리 <onboarding@resend.dev>",
            to: [target.email],
            subject: `[${companyName}] 초과근무 관리 시스템에 초대합니다`,
            html,
          }),
        });

        if (res.ok) {
          results.push({ email: target.email, success: true });
        } else {
          const errBody = await res.text();
          results.push({ email: target.email, success: false, error: errBody });
        }
      } catch (err) {
        results.push({
          email: target.email,
          success: false,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
