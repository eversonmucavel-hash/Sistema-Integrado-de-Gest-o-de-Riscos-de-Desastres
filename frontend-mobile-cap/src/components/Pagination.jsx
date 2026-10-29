import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ count, page, pageSize = 20, onChange }) {
    const totalPages = Math.ceil(count / pageSize);

    if (totalPages <= 1) return null;

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, count);

    // Gerar páginas a mostrar (máx 5 + primeira + última)
    const paginas = [];
    const adicionarSeNovo = (n) => {
        if (n >= 1 && n <= totalPages && !paginas.includes(n)) {
            paginas.push(n);
        }
    };

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) adicionarSeNovo(i);
    } else {
        adicionarSeNovo(1);
        for (let i = page - 1; i <= page + 1; i++) adicionarSeNovo(i);
        adicionarSeNovo(totalPages);
    }

    paginas.sort((a, b) => a - b);

    return (
        <div className="flex items-center justify-between mt-6 bg-white rounded-xl shadow px-4 py-3">
            <div className="text-sm text-gray-600">
                A mostrar <strong>{startItem}</strong>-<strong>{endItem}</strong> de{' '}
                <strong>{count}</strong>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    aria-label="Página anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                {paginas.map((n, i) => {
                    const anterior = paginas[i - 1];
                    const mostrarEllipsis = anterior && n - anterior > 1;

                    return (
                        <span key={n} className="flex items-center">
                            {mostrarEllipsis && (
                                <span className="px-2 text-gray-400">...</span>
                            )}
                            <button
                                onClick={() => onChange(n)}
                                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition ${
                                    n === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {n}
                            </button>
                        </span>
                    );
                })}

                <button
                    onClick={() => onChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    aria-label="Página seguinte"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}