"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function saveFeeFollowup(formData: FormData) {
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
 const {data:profile}=await supabase.from("profiles").select("role,school_id,active").eq("id",user.id).maybeSingle();
 if(!profile?.active||!["admin","accountant"].includes(profile.role)) redirect("/portal?error=not_authorized");
 const studentId=String(formData.get("student_id")||""); const status=String(formData.get("status")||"to_contact");
 const allowed=["to_contact","called_no_answer","message_sent","promised_to_pay","disputed","receipt_check","no_dues","left_school","resolved"];
 if(!studentId||!allowed.includes(status)) redirect("/portal/fees?error=invalid_followup");
 const date=(x:FormDataEntryValue|null)=>{const s=String(x||"").trim();if(!s)return null;if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return "__INVALID__";const d=new Date(`${s}T00:00:00Z`);return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s?s:"__INVALID__"};
 const notes=String(formData.get("notes")||"").trim().slice(0,1000); const promised=date(formData.get("promised_payment_date")); const next=date(formData.get("next_follow_up_date"));\n if(promised==="__INVALID__"||next==="__INVALID__") redirect("/portal/fees?error=invalid_date");\n const {data:student}=await supabase.from("students").select("id").eq("id",studentId).eq("school_id",profile.school_id).eq("active",true).maybeSingle();\n if(!student) redirect("/portal/fees?error=invalid_student");
 const {data:existing,error:existingError}=await supabase.from("fee_followups").select("id").eq("school_id",profile.school_id).eq("student_id",studentId).eq("academic_year","2026-27").maybeSingle();\n if(existingError) redirect("/portal/fees?error=lookup_failed");
 const payload={school_id:profile.school_id,student_id:studentId,academic_year:"2026-27",status,last_contacted_at:new Date().toISOString(),promised_payment_date:promised,next_follow_up_date:next,notes:notes||null,updated_by:user.id};
 let error; if(existing?.id){({error}=await supabase.from("fee_followups").update(payload).eq("id",existing.id));} else {({error}=await supabase.from("fee_followups").insert({...payload,created_by:user.id}));}
 if(error) redirect("/portal/fees?error=save_failed");
 const {error:auditError}=await supabase.from("audit_log").insert({school_id:profile.school_id,actor_id:user.id,action:"fee_followup_saved",entity_type:"student",entity_id:studentId,after_data:{status,promised_payment_date:promised,next_follow_up_date:next,notes:notes||null}});\n if(auditError) redirect("/portal/fees?error=audit_failed");
 revalidatePath("/portal/fees"); revalidatePath("/portal"); redirect("/portal/fees?saved=1");
}