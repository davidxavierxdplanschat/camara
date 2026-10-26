export default function DeputyLoading() {
  return (
    <div className="container-app py-12" role="status" aria-live="polite">
      <span className="sr-only">Carregando perfil...</span>
      <div className="skeleton h-64" />
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="skeleton h-96" />
        <div className="skeleton h-96" />
      </div>
    </div>
  );
}
