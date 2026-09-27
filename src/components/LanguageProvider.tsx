"use client";
import {createContext,useContext,useEffect,useState,ReactNode} from "react";
type Lang="fr"|"en";
const C=createContext({lang:"fr" as Lang,setLang:(_:Lang)=>{}});
export function LanguageProvider({children}:{children:ReactNode}){const[lang,setLangState]=useState<Lang>("fr");useEffect(()=>{const v=localStorage.getItem("visitecard-lang");if(v==="en")setLangState("en")},[]);const setLang=(v:Lang)=>{setLangState(v);localStorage.setItem("visitecard-lang",v)};return <C.Provider value={{lang,setLang}}>{children}</C.Provider>}
export const useLanguage=()=>useContext(C);
