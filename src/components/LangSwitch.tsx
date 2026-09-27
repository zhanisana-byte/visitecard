"use client";
import {useLanguage} from "./LanguageProvider";
export default function LangSwitch(){const{lang,setLang}=useLanguage();return <div className="langSwitch"><button className={lang==="fr"?"active":""} onClick={()=>setLang("fr")}>FR</button><span>|</span><button className={lang==="en"?"active":""} onClick={()=>setLang("en")}>EN</button></div>}
