import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-app py-20">
      <div className="card mx-auto max-w-xl p-8 text-center">
        <p className="eyebrow">Erro 404</p>
        <h1 className="mt-2 text-3xl font-black">Página não encontrada</h1>
        <p className="my-5 text-[var(--muted)]">
          O endereço pode ter mudado ou o deputado informado não existe.
        </p>
        <Link
          className="button-primary inline-flex items-center no-underline"
          href="/"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
