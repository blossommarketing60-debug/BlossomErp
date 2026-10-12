-- Blossom ERP school operations modules (excluding inventory/expenses and staff/payroll per school request).
create table if not exists public.student_attendance (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, attendance_date date not null, status text not null check (status in ('present','absent','late','leave')), notes text, marked_by uuid references auth.users(id), created_at timestamptz not null default now(), unique(student_id, attendance_date));
create table if not exists public.exam_results (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, academic_year text not null, exam_name text not null, subject_name text not null, max_marks numeric(7,2) not null check (max_marks > 0), marks_obtained numeric(7,2) not null check (marks_obtained >= 0 and marks_obtained <= max_marks), remarks text, entered_by uuid references auth.users(id), created_at timestamptz not null default now(), unique(student_id, academic_year, exam_name, subject_name));
create table if not exists public.transport_routes (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, route_name text not null, vehicle_label text, driver_name text, driver_phone text, active boolean not null default true, created_at timestamptz not null default now(), unique(school_id, route_name));
create table if not exists public.student_transport (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, route_id uuid references public.transport_routes(id) on delete set null, stop_name text, monthly_fee_paise bigint not null default 0 check (monthly_fee_paise >= 0), active boolean not null default true, created_at timestamptz not null default now(), unique(student_id));
create table if not exists public.library_books (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, isbn text, title text not null, author text, category text, copies_total integer not null default 1 check (copies_total >= 0), active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.library_loans (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, book_id uuid not null references public.library_books(id) on delete restrict, student_id uuid references public.students(id) on delete set null, borrower_name text, issued_on date not null default current_date, due_on date not null, returned_on date, fine_paise bigint not null default 0 check (fine_paise >= 0), notes text, created_at timestamptz not null default now(), check (student_id is not null or borrower_name is not null));
create table if not exists public.admission_enquiries (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, student_name text not null, applying_class text not null, parent_name text, phone text, source text, status text not null default 'new' check (status in ('new','contacted','visit_scheduled','applied','admitted','not_interested')), follow_up_on date, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.school_notices (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, title text not null, body text not null, audience text not null default 'all' check (audience in ('all','parents','staff','class')), class_name text, publish_at timestamptz, expires_at timestamptz, created_by uuid references auth.users(id), created_at timestamptz not null default now());
create table if not exists public.student_documents (
 id uuid primary key default gen_random_uuid(), school_id uuid not null references public.schools(id) on delete cascade, student_id uuid not null references public.students(id) on delete cascade, document_type text not null, storage_path text not null, uploaded_by uuid references auth.users(id), created_at timestamptz not null default now());
create index if not exists student_attendance_school_date_idx on public.student_attendance(school_id, attendance_date);
create index if not exists exam_results_school_year_idx on public.exam_results(school_id, academic_year);
create index if not exists library_loans_due_idx on public.library_loans(school_id, due_on) where returned_on is null;
create index if not exists admission_enquiries_followup_idx on public.admission_enquiries(school_id, follow_up_on);
create index if not exists school_notices_publish_idx on public.school_notices(school_id, publish_at);
do $$
declare t text;
begin
 foreach t in array array['student_attendance','exam_results','transport_routes','student_transport','library_books','library_loans','admission_enquiries','school_notices','student_documents'] loop
   execute format('alter table public.%I enable row level security', t);
   execute format('drop policy if exists school_staff_all on public.%I', t);
   execute format('create policy school_staff_all on public.%I for all to authenticated using (school_id = public.current_school_id() and public.current_app_role() in (''admin'',''accountant'')) with check (school_id = public.current_school_id() and public.current_app_role() in (''admin'',''accountant''))', t);
 end loop;
end $$;