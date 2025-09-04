import React from 'react';

const PageHeader = ({ title, subtitle, actions }) => {
	return (
		<div className="mb-6">
			<h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
				{title}
			</h1>
			{subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
			{actions && <div className="mt-4">{actions}</div>}
		</div>
	);
};

export default PageHeader;
