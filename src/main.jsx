import React, {useEffect, useMemo, useRef, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Activity, AlertTriangle, ArrowLeft, ArrowRight, Bell, Bot, Camera,
  CheckCircle2, ChevronDown, ClipboardList, FileText, HeartPulse,
  Languages, LayoutDashboard, Leaf, Mic, Paperclip, Search, ShieldCheck,
  Sparkles, Stethoscope, User, Users, Volume2, X, Menu, Send, Upload,
  Clock3, Settings, LogOut
} from "lucide-react";
import "./styles.css";

const LANGS=["English","हिंदी","বাংলা","मराठी","తెలుగు","தமிழ்","ગુજરાતી","ಕನ್ನಡ"];

const defaultPatient={
  name:"Rohan Kumar", age:28, sex:"Male", abha:"5•••1234",
  symptoms:"Fever for 3 days, headache and occasional cough.",
  onset:"2–3 days ago", temperature:"102°F", bp:"120/80", hr:"96"
};

function App(){
  const [screen,setScreen]=useState("welcome");
  const [lang,setLang]=useState("English");
  const [patient,setPatient]=useState(defaultPatient);
  const [consent,setConsent]=useState(false);
  const [text,setText]=useState("");
  const [listening,setListening]=useState(false);
  const [question,setQuestion]=useState(0);
  const [docs,setDocs]=useState([]);
  const [ayush,setAyush]=useState({prakriti:"",vikriti:"",agni:"",dashavidha:""});
  const [toast,setToast]=useState("");
  const [sidebar,setSidebar]=useState(true);

  const questions=[
    "When did the fever start?",
    "Do you have difficulty breathing or chest pain?",
    "Have you taken any medicine for these symptoms?",
    "Do you have any known allergies?"
  ];
  const answers=["Today","2–3 days ago","More than 3 days"];

  function notify(msg){setToast(msg);setTimeout(()=>setToast(""),2600)}
  function start(){setScreen("language")}
  function continueFromLanguage(){setScreen("consent")}
  function continueFromConsent(){if(!consent){notify("Please provide consent to continue.");return} setScreen("symptoms")}
  function addSymptom(){if(text.trim()){setPatient(p=>({...p,symptoms:p.symptoms+" "+text.trim()}));setText("");notify("Symptom added to case history.");}}
  function handleFile(e){
    const list=[...e.target.files];
    if(list.length){setDocs(d=>[...d,...list.map(f=>({name:f.name,size:Math.round(f.size/1024)+" KB",status:"OCR parsed (demo)"}))]);notify("Document added. OCR processing simulated.");}
  }
  function speak(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){notify("Speech recognition is not supported in this browser. Try Chrome.");return}
    if(listening)return;
    const rec=new SR(); rec.lang=lang==="हिंदी"?"hi-IN":"en-IN"; rec.interimResults=false;
    rec.onstart=()=>setListening(true);
    rec.onend=()=>setListening(false);
    rec.onerror=()=>{setListening(false);notify("Microphone recognition failed. You can type instead.");};
    rec.onresult=e=>{const s=e.results[0][0].transcript;setText(s);notify("Voice converted to text.");};
    rec.start();
  }

  return <div className="app">
    {screen==="welcome" && <Welcome onStart={start}/>}
    {screen==="language" && <Language lang={lang} setLang={setLang} onBack={()=>setScreen("welcome")} onNext={continueFromLanguage}/>}
    {screen==="consent" && <Consent consent={consent} setConsent={setConsent} onBack={()=>setScreen("language")} onNext={continueFromConsent}/>}
    {screen==="symptoms" && <SymptomInput patient={patient} text={text} setText={setText} speak={speak} listening={listening} onBack={()=>setScreen("consent")} onNext={()=>setScreen("summary")} addSymptom={addSymptom} lang={lang}/>}
    {screen==="summary" && <InitialSummary patient={patient} onBack={()=>setScreen("symptoms")} onNext={()=>setScreen("questions")}/>}
    {screen==="questions" && <Questions question={question} setQuestion={setQuestion} questions={questions} answers={answers} onBack={()=>setScreen("summary")} onNext={()=>setScreen("documents")}/>}
    {screen==="documents" && <Documents docs={docs} onFile={handleFile} onBack={()=>setScreen("questions")} onNext={()=>setScreen("ayush")}/>}
    {screen==="ayush" && <Ayush ayush={ayush} setAyush={setAyush} onBack={()=>setScreen("documents")} onNext={()=>setScreen("redflag")}/>}
    {screen==="redflag" && <RedFlag onBack={()=>setScreen("ayush")} onNext={()=>setScreen("doctorSummary")}/>}
    {screen==="doctorSummary" && <DoctorSummary patient={patient} docs={docs} onBack={()=>setScreen("redflag")} onSend={()=>{notify("Case summary sent to doctor.");setScreen("doctor")}}/>}
    {screen==="doctor" && <DoctorDashboard patient={patient} sidebar={sidebar} setSidebar={setSidebar} onOpen={()=>setScreen("patientDetail")} onPatient={()=>setScreen("patientDetail")} onLogout={()=>setScreen("welcome")}/>}
    {screen==="patientDetail" && <PatientDetail patient={patient} docs={docs} onBack={()=>setScreen("doctor")}/>}
    {screen==="abdm" && <ABDM onBack={()=>setScreen("doctor")} onNotify={notify}/>}
    {screen==="multilingual" && <Multilingual lang={lang} setLang={setLang} onBack={()=>setScreen("doctor")}/>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
    {screen==="doctor" && <div className="quick-float">
      <button onClick={()=>setScreen("abdm")} title="ABHA / ABDM"><ShieldCheck/></button>
      <button onClick={()=>setScreen("multilingual")} title="Language"><Languages/></button>
    </div>}
  </div>
}

function Shell({children,onBack,title,step}){
 return <div className="screen-shell">
   <header className="topbar"><div className="brand"><div className="logo">
  <img src="/clinsutra-logo.jpg" alt="ClinSutra Logo" />
</div><div><b>ClinSutra</b><span>Smart Case Taking for Better Care</span></div></div><div className="step">{step}</div></header>
   <main className="center-card">{onBack&&<button className="back" onClick={onBack}><ArrowLeft size={17}/> Back</button>}{title&&<h1>{title}</h1>}{children}</main>
 </div>
}

function Welcome({onStart}){
 return <Shell step="Patient">
  <div className="welcome">
    <div className="welcome-copy"><span className="eyebrow">AI-assisted patient case taking</span><h1>Your Health.<br/><strong>Our Priority.</strong></h1><p>Speak or tap your symptoms. ClinSutra helps turn patient information into a structured history for clinician review.</p>
    <div className="hero-actions"><button className="primary big" onClick={onStart}><Mic/> Start Case Taking</button><button className="secondary big" onClick={onStart}><Stethoscope/> Doctor Demo</button></div>
    <div className="mini-trust"><ShieldCheck/> Privacy-aware &nbsp; • &nbsp; Multilingual &nbsp; • &nbsp; Doctor reviewed</div></div>
    <div className="hero-art"><div className="orb"><HeartPulse size={78}/></div><div className="floating-card fc1"><Mic/> Voice first</div><div className="floating-card fc2"><Sparkles/> AI assisted</div><div className="doctor-illustration">🧑‍⚕️<span>+</span>🧑</div></div>
  </div>
 </Shell>
}

function Language({lang,setLang,onBack,onNext}){
 return <Shell title="Select Your Language" step="1 / 8" onBack={onBack}><p className="sub">कृपया अपनी भाषा चुनें / Please choose your language</p><div className="lang-grid">{LANGS.map(x=><button className={lang===x?"lang selected":"lang"} onClick={()=>setLang(x)} key={x}>{x}{lang===x&&<CheckCircle2 size={16}/>}</button>)}</div><button className="primary full" onClick={onNext}>Continue <ArrowRight/></button></Shell>
}
function Consent({consent,setConsent,onBack,onNext}){
 return <Shell title="Your Data, Your Control" step="2 / 8" onBack={onBack}><div className="privacy-box"><ShieldCheck size={42}/><h3>Privacy & Consent</h3><p>Your health information is used to support case taking and is intended for clinician review.</p><div className="privacy-row"><ShieldCheck/> Consent can be withdrawn according to the deployment's privacy policy.</div><div className="privacy-row"><LockIcon/> Access should be protected using appropriate healthcare security controls.</div></div><label className="check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I agree to the terms and consent to continue.</span></label><button className="primary full" onClick={onNext}>Continue <ArrowRight/></button></Shell>
}
function LockIcon(){return <ShieldCheck size={19}/>}

function SymptomInput({patient,text,setText,speak,listening,onBack,onNext,addSymptom,lang}){
 return <Shell title="Tell us about your symptoms" step="3 / 8" onBack={onBack}><div className="voice-panel"><div className={listening?"mic-ring active":"mic-ring"}><Mic size={40}/></div><h3>{listening?"Listening…":"Speak naturally"}</h3><p>Example: “मुझे तीन दिन से बुखार और सिर दर्द है।”</p><button className={listening?"secondary":"primary"} onClick={speak}>{listening?"Listening":"Start Voice Input"} <Mic size={18}/></button></div><div className="divider"><span>or type / select</span></div><div className="input-row"><input value={text} onChange={e=>setText(e.target.value)} placeholder="Type your answer…"/><button className="icon-btn" onClick={addSymptom}><Send/></button></div><div className="chip-row"><button onClick={()=>setText("Fever")}>Fever</button><button onClick={()=>setText("Headache")}>Headache</button><button onClick={()=>setText("Cough")}>Cough</button><button onClick={()=>setText("Body pain")}>Body pain</button></div><div className="nav-row"><button className="back" onClick={onBack}><ArrowLeft/> Back</button><button className="primary" onClick={()=>{addSymptom();onNext()}}>Continue <ArrowRight/></button></div></Shell>
}

function InitialSummary({patient,onBack,onNext}){
 return <Shell title="AI Initial Summary" step="4 / 8" onBack={onBack}><div className="success"><CheckCircle2/> Voice/text converted to structured notes (demo)</div><div className="summary-card"><h3>Patient information</h3><p><b>Chief complaints:</b> {patient.symptoms}</p><p><b>Onset:</b> 2–3 days ago</p><p><b>Preliminary tags:</b> Fever • Headache • Cough</p><div className="notice"><Bot/> This is an AI-assisted summary, not a diagnosis. Clinician review is required.</div></div><button className="primary full" onClick={onNext}>Ask Follow-up Questions <ArrowRight/></button></Shell>
}

function Questions({question,setQuestion,questions,answers,onBack,onNext}){
 return <Shell title="Adaptive Questions" step="5 / 8" onBack={onBack}><div className="chat"><div className="bot"><Bot/> ClinSutra AI</div><p className="bubble ai">{questions[question]}</p><div className="answer-list">{answers.map(a=><button key={a} onClick={()=>{if(question<questions.length-1)setQuestion(question+1)}}>{a}<ArrowRight size={15}/></button>)}</div><div className="chat-input"><input placeholder="Type your answer…"/><Mic size={20}/></div></div><button className="primary full" onClick={onNext}>Continue to Documents <ArrowRight/></button></Shell>
}

function Documents({docs,onFile,onBack,onNext}){
 return <Shell title="Upload Medical Documents" step="6 / 8" onBack={onBack}><p className="sub">Scan or upload prescriptions, lab reports or discharge summaries.</p><div className="upload-grid"><label className="upload-card"><Camera/><b>Camera</b><span>Scan document</span><input type="file" accept="image/*" capture="environment" onChange={onFile}/></label><label className="upload-card"><Upload/><b>Gallery / File</b><span>Choose document</span><input type="file" accept="image/*,.pdf" multiple onChange={onFile}/></label><label className="upload-card"><FileText/><b>PDF</b><span>Upload file</span><input type="file" accept=".pdf" multiple onChange={onFile}/></label></div>{docs.length===0?<div className="empty-doc"><Paperclip/> No documents added yet</div>:<div className="doc-list">{docs.map((d,i)=><div className="doc" key={i}><FileText/><div><b>{d.name}</b><span>{d.size} • {d.status}</span></div><CheckCircle2/></div>)}</div>}<button className="primary full" onClick={onNext}>Continue <ArrowRight/></button></Shell>
}

function Ayush({ayush,setAyush,onBack,onNext}){
 const fields=[["prakriti","Prakriti"],["vikriti","Vikriti"],["agni","Agni"],["dashavidha","Dashavidha Pariksha"]];
 return <Shell title="AYUSH Mode" step="7 / 8" onBack={onBack}><div className="ayush-head"><Leaf size={42}/><div><b>Optional traditional-medicine intake</b><span>Capture fields relevant to the selected AYUSH workflow.</span></div></div><div className="ayush-grid">{fields.map(([k,l])=><label key={k}>{l}<select value={ayush[k]} onChange={e=>setAyush({...ayush,[k]:e.target.value})}><option value="">Select</option><option>Not assessed</option><option>Recorded by practitioner</option><option>Patient reported</option></select></label>)}</div><button className="primary full" onClick={onNext}>Continue to Safety Review <ArrowRight/></button></Shell>
}

function RedFlag({onBack,onNext}){
 return <Shell title="Safety Review" step="8 / 8" onBack={onBack}><div className="redflag"><div className="danger-icon"><AlertTriangle/></div><h2>Priority symptoms need attention</h2><p>ClinSutra can assist with identifying potential red flags for clinician review. It should not make autonomous emergency decisions.</p><ul><li>High fever with concerning symptoms</li><li>Severe headache with vomiting</li><li>Breathing difficulty</li></ul><button className="danger full" onClick={onNext}>Notify / Review by Doctor</button><button className="secondary full" onClick={onNext}>Continue (Non-urgent)</button></div></Shell>
}

function DoctorSummary({patient,docs,onBack,onSend}){
 return <Shell title="Doctor-Ready Summary" step="Review"><div className="doctor-summary"><div className="patient-head"><div className="avatar">RK</div><div><b>{patient.name}</b><span>Age {patient.age} • {patient.sex} • ABHA {patient.abha}</span></div><button className="edit">Edit</button></div><Section title="Chief Complaints"><p>{patient.symptoms}</p></Section><Section title="History of Present Illness"><p>Fever for 3 days with headache and occasional cough. No breathlessness reported in this demo.</p></Section><Section title="Vitals (if available)"><div className="vitals"><span>Temp <b>{patient.temperature}</b></span><span>BP <b>{patient.bp}</b></span><span>HR <b>{patient.hr}</b></span></div></Section><Section title="Documents">{docs.length?<div className="doc-mini">{docs.map(d=><span key={d.name}><FileText/> {d.name}</span>)}</div>:<p className="muted">No documents uploaded.</p>}</Section><div className="notice"><Bot/> AI-assisted summary. Doctor validates and edits before clinical use.</div></div><button className="primary full" onClick={onSend}>Send to Doctor <Send/></button></Shell>
}
function Section({title,children}){return <div className="section"><h4>{title}</h4>{children}</div>}

function DoctorDashboard({patient,sidebar,setSidebar,onOpen,onPatient,onLogout}){
 return <div className="doctor-app"><aside className={sidebar?"sidebar":"sidebar collapsed"}><div className="brand"><div className="logo">
  <img src="/clinsutra-logo.jpg" alt="ClinSutra Logo" />
</div><b>ClinSutra</b></div><nav><button className="active"><LayoutDashboard/> Dashboard</button><button onClick={onPatient}><Users/> Patients</button><button><Clock3/> Appointments</button><button><FileText/> Reports</button><button><Settings/> Settings</button></nav><button className="logout" onClick={onLogout}><LogOut/> Logout</button></aside><section className="dash"><header className="dash-top"><button className="icon-btn" onClick={()=>setSidebar(!sidebar)}><Menu/></button><div className="search"><Search/><input placeholder="Search patient…"/></div><div className="doctor-user"><div className="avatar small">DM</div><span>Dr. Mehta<br/><small>General Physician</small></span></div></header><div className="dash-content"><div className="dash-title"><div><span className="eyebrow">Today</span><h1>Doctor Dashboard</h1></div><button className="primary" onClick={onOpen}>View latest case</button></div><div className="stats"><Stat icon={<Users/>} label="Today's Patients" value="24"/><Stat icon={<AlertTriangle/>} label="Priority Review" value="3"/><Stat icon={<FileText/>} label="AI Summaries" value="18"/><Stat icon={<Clock3/>} label="Time Saved" value="2.4h"/></div><div className="panel"><div className="panel-head"><h3>Today's Patients</h3><button>View all</button></div><div className="table"><Row name="Rohan Kumar" tag="High Priority" time="10:20 AM" onClick={onOpen}/><Row name="Priya Singh" tag="Normal" time="11:00 AM" onClick={onPatient}/><Row name="Suresh Yadav" tag="Normal" time="11:45 AM" onClick={onPatient}/></div></div><div className="dash-note"><ShieldCheck/> Patient data should be handled according to applicable healthcare privacy, consent and security requirements.</div></div></section></div>
}
function Stat({icon,label,value}){return <div className="stat"><div className="stat-icon">{icon}</div><span>{label}</span><b>{value}</b></div>}
function Row({name,tag,time,onClick}){return <div className="table-row"><div className="avatar small">{name.split(" ").map(x=>x[0]).join("")}</div><b>{name}</b><span className={tag==="High Priority"?"tag high":"tag"}>{tag}</span><span>{time}</span><button className="primary tiny" onClick={onClick}>View</button></div>}

function PatientDetail({patient,docs,onBack}){
 return <div className="detail-page"><header className="topbar"><button className="back" onClick={onBack}><ArrowLeft/> Dashboard</button><div className="brand"><div className="logo">
  <img src="/clinsutra-logo.jpg" alt="ClinSutra Logo" />
</div><b>ClinSutra</b></div></header><main className="detail"><div className="detail-head"><div className="avatar large">RK</div><div><h1>{patient.name}</h1><p>Male • 28 years • ABHA {patient.abha}</p></div><button className="primary">Edit Summary</button></div><div className="tabs"><b>Clinical History</b><span>Reports</span><span>Notes</span></div><div className="detail-grid"><div className="panel"><Section title="Chief Complaints"><p>{patient.symptoms}</p></Section><Section title="Vitals"><div className="vitals"><span>Temp <b>{patient.temperature}</b></span><span>BP <b>{patient.bp}</b></span><span>HR <b>{patient.hr}</b></span></div></Section><Section title="AI Safety Review"><div className="notice"><AlertTriangle/> Potential red flags are surfaced for clinician review.</div></Section></div><div className="panel"><Section title="Documents">{docs.length?docs.map(d=><div className="doc-mini" key={d.name}><FileText/> {d.name}</div>):<p>No documents uploaded.</p>}</Section><Section title="Interoperability"><div className="checkline"><CheckCircle2/> FHIR R4-ready data model (prototype)</div><div className="checkline"><CheckCircle2/> ABDM / ABHA integration screen (prototype)</div></Section></div></div></main></div>
}
function ABDM({onBack,onNotify}){
 return <Shell title="ABHA / ABDM Integration" step="Integration" onBack={onBack}><div className="abdm"><ShieldCheck size={50}/><h2>Ayushman Bharat Digital Mission</h2><p>Prototype screen for linking health records. Real ABDM/ABHA API integration requires approved credentials, consent and implementation.</p><div className="abha-card"><span>ABHA ID</span><b>5•••1234</b><em>Verified (demo)</em></div><button className="primary full" onClick={()=>onNotify("ABHA link flow simulated.")}>Link Health Records</button><div className="checkline"><CheckCircle2/> FHIR R4 interoperability planned</div><div className="checkline"><CheckCircle2/> HIS / EMR integration planned</div></div></Shell>
}
function Multilingual({lang,setLang,onBack}){
 return <Shell title="Multilingual Support" step="Language" onBack={onBack}><div className="language-demo"><Languages size={46}/><h2>{lang}</h2><p>Patients can use the selected language in the prototype. Production voice translation depends on the configured speech/language service.</p><div className="bubble ai">आपको कब से बुखार है?</div><div className="answer-list"><button>आज से <ArrowRight/></button><button>2–3 दिन से <ArrowRight/></button><button>एक सप्ताह से <ArrowRight/></button></div><div className="lang-grid compact">{LANGS.map(x=><button className={lang===x?"lang selected":"lang"} onClick={()=>setLang(x)} key={x}>{x}</button>)}</div></div></Shell>
}

createRoot(document.getElementById("root")).render(<App/>);
