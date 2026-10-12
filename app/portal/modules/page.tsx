import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const modules = [
  { title: "Student records & import", status: "Needs import workflow", detail: "CSV validation, duplicate review, photo matching and import report." },
  { title: "Fees & receipts", status: "Core workflow present; test required", detail: "Installments, guarded payment posting, balances and receipt ledger." },
  { title: "Attendance", status: "Database foundation added", detail: "Daily present/absent/late/leave records; teacher workflow and parent alerts still needed." },
  { title: "Exams & report cards", status: "Database foundation added", detail: "Subject marks, exam records and grading; report-card UI/PDF still needed." },
  { title: "Transport", status: "Database foundation added", detail: "Routes, vehicle/driver details, student route assignments and transport fee fields." },
  { title: "Library", status: "Database foundation added", detail: "Book catalogue, loans, due dates and fines; circulation UI still needed." },
  { title: "Admissions CRM", status: "Database foundation added", detail: "Enquiries, follow-up dates and admission pipeline; staff workflow still needed." },
  { title: "Notices & announcements", status: "Database foundation added", detail: "Audience-targeted notices; publishing UI and delivery integrations still needed." },
  { title: "Student document vault", status: "Database foundation added", detail: "Document metadata is ready; private storage, upload and signed access still needed." },
  { title: "Parent portal & notifications", status: "Partially scaffolded", detail: "Parent-linked student view exists; secure notices, attendance, results and messaging remain." },
  { title: "Analytics & reports", status: "Needs implementation", detail: "Collection summaries, attendance trends, admission funnel and exportable reports." },
  { title: "WhatsApp integration", status: "Not connected", detail: "Requires provider account, consent controls, templates and delivery logging." },
  { title: "Hindi/English", status: "Not implemented", detail: "Add translated UI strings and language preference." },
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
