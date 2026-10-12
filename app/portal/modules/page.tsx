import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const modules = [
  { title: "Student register", status: "Import and verify", detail: "CSV import, duplicate checks and student photo matching." },
  { title: "Fees & receipts", status: "Core workflow; testing required", detail: "Installments, balances, payment posting and receipt ledger." },
];

export default async function ModulesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role,active").eq("id", user.id).maybeSingle();
  if (!profile?.active || profile.role !== "admin") return <main className="formcard"><h1>Administrator access required</h1><Link className="btn" href="/portal">Back to portal</Link></main>;
  const checks = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("student_attendance").select("id", { count: "exact", head: true }),
    supabase.from("exam_results").select("id", { count: "exact", head: true }),
    supabase.from("transport_routes").select("id", { count: "exact", head: true }),
    supabase.from("library_books").select("id", { count: "exact", head: true }),
    supabase.from("admission_enquiries").select("id", { count: "exact", head: true }),
  ]);
  const values = checks.map(x => x.error ? "Unavailable" : String(x.count ?? 0));
  return <main className="dashboard">
    <header className="dashhead"><div className="brand"><div className="logo">B</div><div><b>Blossom School ERP</b><small>Module readiness · 2026–27</small></div></div><Link className="btn" href="/portal">Back to portal</Link></header>
    <section className="welcome"><div><p className="eyebrow">ADMINISTRATION</p><h1>ERP modules & readiness</h1><p>Track what is available, what has only a database foundation, and what still needs a working interface and testing.</p></div></section>
    <section className="stats">
      {["Students","Attendance entries","Exam results","Transport routes","Library books","Admission enquiries"].map((label,i)=><article className="stat" key={label}><span>{label}</span><strong>{values[i]}</strong></article>)}
    </section>
    <section className="panel"><h2>Feature status</h2><p className="muted">A database table is not a finished feature. Modules marked as database foundation still need screens, validation, role checks and end-to-end tests before staff use them.</p><div className="modulegrid">{modules.map(m=><article className="modulecard" key={m.title}><h3>{m.title}</h3><span className="moduleStatus">{m.status}</span><p>{m.detail}</p></article>)}</div></section>
    <section className="panel"><h2>Excluded by your request</h2><p>Inventory/expenses management and staff/payroll management are intentionally not included in the planned modules.</p></section>
    <section className="panel"><h2>Required before live school use</h2><ul><li>Import and verify the 333 student records; resolve provisional admission numbers and missing/invalid dates.</li><li>Upload student photos and documents to private storage, matching each file to the correct student.</li><li>Test administrator/accountant permissions and student/parent isolation.</li><li>Run payment tests for receipts, repeated submissions, overpayment prevention and audit logs.</li><li>Enable leaked-password protection, review database security warnings, and test backups/restoration.</li></ul></section>
  </main>;
}
