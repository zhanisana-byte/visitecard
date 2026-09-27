"use client";
import Link from "next/link";import Brand from "./Brand";import LangSwitch from "./LangSwitch";import {useLanguage} from "./LanguageProvider";
export default function PublicHeader(){const{lang}=useLanguage();return <header className="publicHeader"><div className="headerInner"><Brand/><div className="headerActions"><LangSwitch/><Link className="btn outline" href="/connexion">{lang==="fr"?"Connexion":"Sign in"}</Link><Link className="btn primary" href="/creer-compte">{lang==="fr"?"Créer un compte":"Create account"}</Link></div></div></header>}
