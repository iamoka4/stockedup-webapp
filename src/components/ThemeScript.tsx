import { DEFAULT_PREFERENCE, STORAGE_KEY } from "@/lib/theme";

const script = `(function(){try{
var p=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
if(p!=="light"&&p!=="dark"&&p!=="system")p=${JSON.stringify(DEFAULT_PREFERENCE)};
var d=p==="dark"||(p==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
var r=d?"dark":"light";
var e=document.documentElement;
e.dataset.theme=r;e.dataset.themePref=p;e.style.colorScheme=r;
}catch(_){}})();`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}