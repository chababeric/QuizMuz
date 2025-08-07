
export default function ScoreCard({ rank, username, score, user }) {
    const getRankData = (rank) => {
        switch (rank) {
            case 1:
                return {
                    color: 'from-yellow-400 via-amber-500 to-yellow-600',
                    borderColor: 'border-yellow-400/50',
                    textColor: 'text-yellow-100',
                    icon: '👑',
                    label: '1er'
                };
            case 2:
                return {
                    color: 'from-slate-300 via-gray-400 to-slate-500',
                    borderColor: 'border-slate-400/50',
                    textColor: 'text-slate-100',
                    icon: '🥈',
                    label: '2ème'
                };
            case 3:
                return {
                    color: 'from-amber-600 via-orange-700 to-amber-800',
                    borderColor: 'border-amber-600/50',
                    textColor: 'text-amber-100',
                    icon: '🥉',
                    label: '3ème'
                };
            default:
                return {
                    color: 'from-indigo-600 via-purple-600 to-indigo-700',
                    borderColor: 'border-indigo-400/50',
                    textColor: 'text-indigo-100',
                    icon: '🏅',
                    label: `${rank}ème`
                };
        }
    };

    const isCurrentUser = user === username;
    const rankData = getRankData(rank);

    return (
        <div className={`relative group transition-all duration-300 hover:scale-110 ${isCurrentUser ? 'scale-105' : ''}`}>
            {/* Current User Indicator */}
            {isCurrentUser && (
                <div className="absolute -top-3 -right-2 z-10">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full p-1.5 shadow-lg animate-pulse">
                        <span className="text-xs">👤</span>
                    </div>
                </div>
            )}

            {/* Main Card */}
            <div className={`
                relative w-32 h-44 rounded-2xl shadow-2xl backdrop-blur-sm border-2 transition-all duration-300
                bg-gradient-to-br ${rankData.color} ${rankData.borderColor}
                ${isCurrentUser ? 'ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-transparent' : ''}
                group-hover:shadow-3xl group-hover:border-opacity-80
            `}>
                {/* Rank Badge */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className={`
                        bg-gradient-to-r ${rankData.color} rounded-full px-3 py-1 shadow-lg border-2 ${rankData.borderColor}
                    `}>
                        <div className="flex items-center gap-1">
                            <span className="text-lg">{rankData.icon}</span>
                            <span className={`text-xs font-bold ${rankData.textColor}`}>
                                {rankData.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Card Content */}
                <div className="p-4 pt-6 h-full flex flex-col justify-center items-center text-center">
                    {/* Username */}
                    <div className="mb-3">
                        <h3 className={`font-bold text-sm ${rankData.textColor} leading-tight`}>
                            {username}
                        </h3>
                        {isCurrentUser && (
                            <div className="mt-1 text-xs text-emerald-200 font-medium">
                                Vous
                            </div>
                        )}
                    </div>

                    {/* Score Display */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                        <div className="flex items-center gap-1">
                            <span className="text-lg">🏆</span>
                            <div>
                                <div className={`text-xs ${rankData.textColor} opacity-80`}>Score</div>
                                <div className={`text-xl font-bold ${rankData.textColor}`}>{score}</div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className={`w-1 h-1 rounded-full bg-white/30`}></div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Glow Effect for Top 3 */}
                {rank <= 3 && (
                    <div className={`
                        absolute inset-0 rounded-2xl opacity-20 blur-xl
                        bg-gradient-to-br ${rankData.color}
                        group-hover:opacity-30 transition-opacity duration-300
                    `}></div>
                )}
            </div>

            {/* Position Indicator */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg px-2 py-1 border border-slate-600/50">
                    <span className="text-xs text-slate-200 font-medium">#{rank}</span>
                </div>
            </div>
        </div>
    );
}
