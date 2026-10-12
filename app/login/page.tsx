"use client";
import {FormEvent,useState} from "react";
import Link from "next/link";
import {useRouter,useSearchParams} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
export default function LoginPage(){
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const router=useRouter(),params=useSearchParams();
 async function submit(e:FormEvent){e.preventDefault();setError("");setBusy(true);try{const supabase=createClient();const {error}=await supabase.auth.signInWithPassword({email,password});if(error)throw error;router.push(params.get("next")||"/portal");router.refresh();}catch(err:any){setError(err?.message||"Unable to sign in. Check Supabase setup.");}finally{setBusy(false);}}
 return <main className="formcard"><Link href="/" className="brand" style={{marginBottom:26}}><div className="logo">B</div><div><b>Blossom School ERP</b><small style={{color:"var(--muted)"}}>School staff & parent sign-in</small></div></Link><h1>Welcome back</h1><p>Sign in with the account invited by your school administrator.</p>{params.get("setup")==="supabase"&&<div className="notice">Setup required: configure Supabase URL and anon key in the deployment environment.</div>}<form onSubmit={submit}><div className="field"><label>Email address</label><input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div><div className="field"><label>Password</label><input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password"/></div>{error&&<div className="error" role="alert">{error}</div>}<button className="btn primary" disabled={busy} style={{width:"100%"}}>{busy?"Signing in…":"Sign in securely"}</button></form><div className="footerNote">For account creation or password recovery, contact the school administrator. Public self-registration is intentionally disabled.</div></main>;
}
