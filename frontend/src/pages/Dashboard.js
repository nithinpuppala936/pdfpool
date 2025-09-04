import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Logo from '../components/Logo';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { FileText, Upload, Download, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
	const { user } = useAuth();
	const navigate = useNavigate();

	const stats = [
		{ name: 'Total Documents', value: '0', icon: FileText, color: 'text-blue-600' },
		{ name: 'Storage Used', value: '0 MB', icon: Download, color: 'text-green-600' },
		{ name: 'Daily Uploads', value: '0/3', icon: Upload, color: 'text-orange-600' },
		{ name: 'Storage Usage', value: '0%', icon: BarChart3, color: 'text-purple-600' }
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<PageHeader title="Dashboard" subtitle={`Welcome back, ${user?.name || 'user'}!`} />
				<div className="hidden md:block">
					<Logo size="small" />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard icon={FileText} label={stats[0].name} value={stats[0].value} accent="from-indigo-500 to-purple-500" />
				<StatCard icon={Download} label={stats[1].name} value={stats[1].value} accent="from-emerald-500 to-teal-500" />
				<StatCard icon={Upload} label={stats[2].name} value={stats[2].value} accent="from-amber-500 to-orange-500" />
				<StatCard icon={BarChart3} label={stats[3].name} value={stats[3].value} accent="from-fuchsia-500 to-pink-500" />
			</div>

			<div className="card">
				<h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
					<button onClick={() => navigate('/pdf-tools')} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all duration-200 text-left group">
						<div className="flex items-center">
							<div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 group-hover:from-purple-600 group-hover:to-blue-700 transition-all duration-200">
								<Upload className="h-5 w-5 text-white" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-900">Upload PDF</p>
								<p className="text-xs text-gray-500">Upload a new document</p>
							</div>
						</div>
					</button>
					
					<button onClick={() => navigate('/pdf-tools')} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all duration-200 text-left group">
						<div className="flex items-center">
							<div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 group-hover:from-green-600 group-hover:to-teal-700 transition-all duration-200">
								<FileText className="h-5 w-5 text-white" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-900">Merge PDFs</p>
								<p className="text-xs text-gray-500">Combine multiple files</p>
							</div>
						</div>
					</button>
					
					<button onClick={() => navigate('/conversions')} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all duration-200 text-left group">
						<div className="flex items-center">
							<div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 group-hover:from-orange-600 group-hover:to-red-700 transition-all duration-200">
								<Download className="h-5 w-5 text-white" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-900">Convert Files</p>
								<p className="text-xs text-gray-500">Change file formats</p>
							</div>
						</div>
					</button>
					
					<button onClick={() => navigate('/analytics')} className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all duration-200 text-left group">
						<div className="flex items-center">
							<div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 group-hover:from-purple-600 group-hover:to-pink-700 transition-all duration-200">
								<BarChart3 className="h-5 w-5 text-white" />
							</div>
							<div className="ml-3">
								<p className="text-sm font-medium text-gray-900">View Analytics</p>
								<p className="text-xs text-gray-500">Check your usage</p>
							</div>
						</div>
					</button>
				</div>
			</div>

			<div className="card bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border-white/20">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-2">Get Started with PDFPOOL</h2>
						<p className="text-gray-700 mb-4">
							Start managing your PDF documents with our powerful tools. Upload, merge, convert, and sign documents with ease.
						</p>
						<button onClick={() => navigate('/pdf-tools')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200">
							Upload Your First Document
						</button>
					</div>
					<div className="hidden lg:block">
						<Logo size="large" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
