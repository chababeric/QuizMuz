export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <div
            {...props}
            className={`bg-gradient-to-r from-red-900/40 to-rose-900/40 backdrop-blur-sm rounded-lg px-4 py-3 border border-red-500/50 shadow-lg ${className}`}
        >
            <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <p className="text-red-200 font-medium text-sm">{message}</p>
            </div>
        </div>
    ) : null;
}
