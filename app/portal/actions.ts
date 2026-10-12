"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function generateInstallments(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role,active").eq("id", user.id).maybeSingle();
  if (!profile?.active || !["admin", "accountant"].includes(profile.role)) redirect("/portal?error=not_authorized");
  const studentId = String(formData.get("student_id") || "");
  if (!studentId) redirect("/portal?error=missing_student");
  const { error } = await supabase.rpc("generate_student_installments", { p_student_id: studentId, p_academic_year: "2026-27" });
  if (error) redirect("/portal?error=installments_failed");
  revalidatePath("/portal");
  redirect("/portal?success=installments_generated");
}

export async function recordPayment(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role,active").eq("id", user.id).maybeSingle();
  if (!profile?.active || !["admin", "accountant"].includes(profile.role)) redirect("/portal?error=not_authorized");
  const studentId = String(formData.get("student_id") || "");
  const amountRupees = Number(formData.get("amount_rupees"));
  const method = String(formData.get("method") || "");
  const transactionRef = String(formData.get("transaction_ref") || "").trim().slice(0,120);
  const notes = String(formData.get("notes") || "").trim().slice(0,300);
  const methods = ["cash", "upi", "bank_transfer", "card", "cheque", "other"];
  if (!studentId || !Number.isFinite(amountRupees) || amountRupees <= 0 || !Number.isSafeInteger(Math.round(amountRupees * 100)) || !methods.includes(method)) redirect("/portal?error=invalid_payment");
  const { data, error } = await supabase.rpc("record_fee_payment", {
    p_student_id: studentId,
    p_amount_paise: Math.round(amountRupees * 100),
    p_method: method,
    p_idempotency_key: randomUUID(),
    p_transaction_ref: transactionRef || null,
    p_notes: notes || null
  });
  if (error) redirect("/portal?error=payment_failed");
  revalidatePath("/portal");
  const first = Array.isArray(data) ? data[0] : data;
  const receipt = first?.receipt_no || first?.receiptNo || "";
  redirect("/portal?success=payment_recorded" + (receipt ? "&receipt=" + encodeURIComponent(receipt) : ""));
}
