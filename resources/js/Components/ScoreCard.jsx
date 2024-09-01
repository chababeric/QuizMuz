export default function ScoreCard({ rank, username, score, user }) {
    const getRankStyle = (rank) => {
        switch (rank) {
            case 1:
                return { color: 'rgb(255, 215, 0)' }; // Gold color
            case 2:
                return { color: 'rgb(192, 192, 192)' }; // Silver color
            case 3:
                return { color: 'rgb(205, 127, 50)' }; // Bronze color
            default:
                return { color: 'rgb(190, 18, 60)' }; // Default color
        }
    };

    const isCurrentUser = user === username;
    const borderColor = isCurrentUser ? 'border-green-600' : 'border-rose-600';
    const borderWidth = isCurrentUser ? 'border-2' : 'border';

    return (
        <div
            className={`flex flex-col justify-center items-center w-[125px] h-[170px] ${borderWidth} ${borderColor} rounded-lg shadow-lg bg-gradient-to-r from-gray-800 to-gray-900 p-4 transform transition-transform duration-300 hover:scale-105`}
            style={getRankStyle(rank)}
        >
            <p className="text-3xl font-bold mb-2">{rank}</p>
            <p className="text-xs font-semibold mb-1">{username}</p>
            <p className="text-xs">Score: {score}</p>
        </div>
    );
};
