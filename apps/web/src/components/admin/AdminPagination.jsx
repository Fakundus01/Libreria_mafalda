import Button from '../Button';

function AdminPagination({ meta, loading = false, onPrevious, onNext }) {
  if (!meta) return null;

  const currentPage = Math.floor(meta.offset / meta.limit) + 1;
  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / meta.limit));

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
      <p className="text-sm text-ink/65">
        Mostrando {meta.offset + 1}-{Math.min(meta.offset + meta.limit, meta.total)} de {meta.total}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink">Pagina {currentPage} de {totalPages}</span>
        <Button as="button" type="button" disabled={loading || !meta.has_prev} onClick={onPrevious} className="border border-stone-200 bg-white text-ink">
          Anterior
        </Button>
        <Button as="button" type="button" disabled={loading || !meta.has_next} onClick={onNext} className="bg-ink text-white">
          Siguiente
        </Button>
      </div>
    </div>
  );
}

export default AdminPagination;
