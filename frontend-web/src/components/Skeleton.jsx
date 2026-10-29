export function Skeleton({ className = '' }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow p-5">
            <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="mt-4 flex gap-4">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5 }) {
    return (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <div className="border-b border-gray-200 p-4">
                <Skeleton className="h-4 w-1/4" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-0"
                >
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                </div>
            ))}
        </div>
    );
}

export function SkeletonStats({ count = 4 }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-4">
                    <Skeleton className="h-3 w-20 mb-2" />
                    <Skeleton className="h-7 w-16" />
                </div>
            ))}
        </div>
    );
}