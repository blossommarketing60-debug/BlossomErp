"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function importStudents(rows: Record<string,string>[]) {
 const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user) redirect("/login");
 const {data:profile}=await supabase.from("profiles").select("role,active").eq("id",user.id).maybeSingle(); if(!profile?.active||profile.role!=="admin") redirect("/portal/import?error=not_authorized");
 if(!Array.isArray(rows)||rows.length<1||rows.length>500) redirect("/portal/import?error=invalid_rows");
 const allowed=["source_sheet","source_row","admission_no","full_name","class_name","section","date_of_birth","father_name","mother_name","guardian_phone","address","pen_no","import_notes"];
 const clean=rows.map(row=>Object.fromEntries(allowed.map(key=>[key,String(row[key]??"").trim()])));
 const {data,error}=await supabase.rpc("import_students_csv",{p_rows:clean});
 if(error){const m=error.message||"";const code=m.includes("Duplicate admission")?"duplicate_ids":m.includes("admission number, student name and class")?"required_fields":m.includes("Date of birth")?"invalid_dates":"import_failed";redirect("/portal/import?error="+code);}
 revalidatePath("/portal");revalidatePath("/portal/modules");redirect("/portal/import?success=1&inserted="+Number(data?.inserted||0)+"&skipped="+Number(data?.skipped_existing||0));
}