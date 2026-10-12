-- Blossom School ERP: class-wise annual fee plans for academic year 2026-27.
-- Apply only after the schema exists. Amounts are stored in paise.
insert into public.fee_plans(school_id,academic_year,class_name,annual_amount_paise,installments)
select s.id,'2026-27',v.class_name,v.annual_rupees*100,4 from public.schools s
cross join (values ('Nursery',13200),('L.K.G',15800),('U.K.G',17400),('I',19400),('II',20400),('III',20400),('IV',20400),('V',20400),('VI',23200),('VII',23200),('VIII',23200),('IX',24800),('X',24800),('XI',26800),('XII',26800)) as v(class_name,annual_rupees)
where s.slug='blossom-banswara'
on conflict(school_id,academic_year,class_name) do update set annual_amount_paise=excluded.annual_amount_paise,installments=excluded.installments;
insert into public.installment_templates(school_id,academic_year,term_no,title,due_date)
select s.id,'2026-27',v.term_no,v.title,v.due_date::date from public.schools s
cross join (values (1,'Term 1','2026-07-01'),(2,'Term 2','2026-09-15'),(3,'Term 3','2026-11-15'),(4,'Term 4','2026-12-15')) as v(term_no,title,due_date)
where s.slug='blossom-banswara'
on conflict(school_id,academic_year,term_no) do update set title=excluded.title,due_date=excluded.due_date;
