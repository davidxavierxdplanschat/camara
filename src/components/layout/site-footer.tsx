import { branding } from "@/config/branding";

export function SiteFooter() {
  const text = (
    <>
      © 2026 David Xavier. Desenvolvido por{" "}
      {branding.xdPlansUrl ? (
        <a className="font-bold underline" href={branding.xdPlansUrl}>
          XD Plans
        </a>
      ) : (
        <span className="font-bold">XD Plans</span>
      )}
      . Dados públicos extraídos diretamente do Portal de Dados Abertos da
      Câmara dos Deputados.
    </>
  );
  return (
    <footer className="mt-16 border-t border-[var(--line)] bg-[var(--ink)] py-8 text-sm leading-6 text-white">
      <div className="container-app">{text}</div>
    </footer>
  );
}
