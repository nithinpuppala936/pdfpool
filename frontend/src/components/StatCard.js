import React from 'react';

const StatCard = ({ icon: Icon, label, value, accent = 'from-blue-500 to-cyan-500' }) => {
	return (
		<div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-lg shadow-black/5">
			<div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${accent} opacity-15`} />
			<div className="relative flex items-center gap-3">
				<div className={`p-2 rounded-lg bg-gradient-to-br ${accent} text-white`}> <Icon className="h-5 w-5" /> </div>
				<div>
					<p className="text-gray-500 text-xs">{label}</p>
					<p className="text-gray-900 text-2xl font-semibold tracking-tight">{value}</p>
				</div>
			</div>
		</div>
	);
};

export default StatCard;
