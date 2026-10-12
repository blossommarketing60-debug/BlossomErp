import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {signOut} from "./signout";
import {generateInstallments,recordPayment} from "./actions";

const rupees=(paise:number|string)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(Number(paise||0)/100);

export default async function PortalPage({searchParams}:{searchParams:Promise<{success?:string;error?:string;receipt?:string}>}){
 const params=await searchParams;
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/login");
 const {data:profile}=await supabase.from("profiles").select("full_name,role,school_id,active").eq("id",user.id).maybeSingle();
 if(!profile||!profile.active)return <main className="formcard"><h1>Account access unavailable</h1><p>Your profile is missing or inactive. Please contact the school administrator.</p><form action={signOut}><button className="btn">Sign out</button></form></main>;
 let students:any[]=[];
 if(profile.role==="parent"){
  const {data}=await supabase.from("parent_students").select("student:students(id,admission_no,full_name,class_name,section,father_name,mother_name,guardian_phone,photo_path)").eq("parent_user_id",user.id);
  students=(data||[]).map((x:any)=>x.student).filter(Boolean);
 } else {
  const {data,error}=await supabase.from("students").select("id,admission_no,full_name,class_name,section,father_name,mother_name,guardian_phone,photo_path").eq("school_id",profile.school_id).eq("active",true).order("class_name").order("full_name").limit(1000);
  if(!error)students=data||[];
 }
 const {data:plans}=await supabase.from("fee_plans").select("class_name,annual_amount_paise,installments").eq("school_id",profile.school_id).eq("academic_year","2026-27").order("class_name");
 const {data:balances}=await supabase.from("student_fee_balances").select("student_id,net_charges_paise,paid_paise,balance_paise").eq("school_id",profile.school_id).eq("academic_year","2026-27");
 const balanceByStudent=new Map((balances||[]).map((b:any)=>[b.student_id,b]));
 const canCollect=["admin","accountant"].includes(profile.role);
 const messages:Record<string,string>={installments_generated:"Installments generated or already existed.",payment_recorded:"Payment recorded successfully.",not_authorized:"Your role is not permitted to do that.",missing_student:"Please select a student.",installments_failed:"Could not generate installments. Check the fee plan and installment dates.",invalid_payment:"Check the payment amount and method.",payment_failed:"Payment was not posted. Check the outstanding balance and try again."};
 return <main className="dashboard">
 <header className="dashhead"><div className="brand"><div className="logo">B</div><div><b>Blossom School ERP</b><small>Academic year 2026–27</small></div></div><form action={signOut}><button className="btn">Sign out</button></form></header>
 <section className="welcome"><div><p className="eyebrow">{profile.role.toUpperCase()} PORTAL</p><h1>Hello, {profile.full_name||user.email}</h1><p>Blossom Kindergarten Senior Sec. School · Banswara, Rajasthan</p></div></section>
 {params.success&&<div className="panel" role="status"><b>{messages[params.success]||"Completed."}</b>{params.receipt&&<p>Receipt: {params.receipt}</p>}</div>}
 {params.error&&<div className="panel" role="alert"><b>{messages[params.error]||"The request could not be completed."}</b><p className="muted">No success is shown unless the database operation completes.</p></div>}
 <section className="stats">
 <article className="stat"><span>{profile.role==="parent"?"Linked students":"Active students"}</span><strong>{students.length}</strong></article>
 <article className="stat"><span>Class fee plans</span><strong>{plans?.length||0}</strong></article>
 <article className="stat"><span>Students with fee records</span><strong>{(balances||[]).length}</strong></article>
 </section>
 <section className="panel"><h2>{profile.role==="parent"?"Your students":"Student directory & fee balances"}</h2>
 {students.length===0?<p className="muted">No student records are loaded yet. Import the verified 2026–27 student register to begin.</p>:<div className="tablewrap"><table><thead><tr><th>Admission no.</th><th>Student</th><th>Class</th><th>Father / guardian</th><th>Annual charges</th><th>Paid</th><th>Balance</th>{canCollect&&<th>Actions</th>}</tr></thead><tbody>{students.map((s:any)=>{const b:any=balanceByStudent.get(s.id);return <tr key={s.id}><td>{s.admission_no||"—"}</td><td><b>{s.full_name}</b><div className="muted">{s.section||""}</div></td><td>{s.class_name}</td><td>{s.father_name||"—"}<div className="muted">{s.guardian_phone||""}</div></td><td>{b?rupees(b.net_charges_paise):"Not generated"}</td><td>{b?rupees(b.paid_paise):"—"}</td><td><b>{b?rupees(b.balance_paise):"—"}</b></td>{canCollect&&<td><div className="actionstack"><form action={generateInstallments}><input type="hidden" name="student_id" value={s.id}/><button className="btn btn-small" type="submit">Generate installments</button></form><form action={recordPayment} className="paymentform"><input type="hidden" name="student_id" value={s.id}/><label>Amount (₹)<input name="amount_rupees" type="number" min="0.01" step="0.01" required placeholder="e.g. 3300"/></label><label>Method<select name="method" defaultValue="cash"><option value="cash">Cash</option><option value="upi">UPI</option><option value="bank_transfer">Bank transfer</option><option value="card">Card</option><option value="cheque">Cheque</option><option value="other">Other</option></select></label><label>Transaction reference (optional)<input name="transaction_ref" maxLength={120}/></label><label>Notes (optional)<input name="notes" maxLength={300}/></label><button className="btn" type="submit">Record payment</button></form></div></td>}</tr>})}</tbody></table></div>}
 {canCollect&&<p className="muted">Payment posting uses the database transaction, rejects amounts above the outstanding balance, allocates against oldest due installments, and records an audit trail. Verify the receipt and payment ledger after each live transaction.</p>}
 </section>
 <section className="panel"><h2>Annual fee schedule · 2026–27</h2><div className="tablewrap"><table><thead><tr><th>Class</th><th>Annual fee</th><th>Installments</th><th>Per installment</th></tr></thead><tbody>{(plans||[]).map((p:any)=><tr key={p.class_name}><td>{p.class_name}</td><td>{rupees(p.annual_amount_paise)}</td><td>{p.installments}</td><td>{rupees(Math.round(p.annual_amount_paise/p.installments))}</td></tr>)}</tbody></table></div></section>
 </main>;
}
