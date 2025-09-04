import React, { useRef, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { toast } from 'react-hot-toast';
import axios from 'axios';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const Signatures = () => {
	const [pdfFile, setPdfFile] = useState(null);
	const [numPages, setNumPages] = useState(null);
	const [pageNumber, setPageNumber] = useState(1);
	const [pageDims, setPageDims] = useState({ width: 0, height: 0 });
	const canvasRef = useRef(null);
	const [drawing, setDrawing] = useState(false);
	const [strokeColor, setStrokeColor] = useState('#111827');
	const [strokeWidth, setStrokeWidth] = useState(2);
	const [signaturePreview, setSignaturePreview] = useState(null);
	const [placing, setPlacing] = useState(false);
	const [placePoint, setPlacePoint] = useState(null);
	const [placingWidth, setPlacingWidth] = useState(180);

	const onPdfChange = (e) => {
		const f = e.target.files?.[0];
		if (f && f.type === 'application/pdf') setPdfFile(f);
		else toast.error('Please upload a PDF file');
	};

	const handleCanvasResize = useCallback(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		// Resize to container
		const parent = canvas.parentElement;
		canvas.width = parent.clientWidth;
		canvas.height = 200;
		// Clear
		const ctx = canvas.getContext('2d');
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}, []);

	React.useEffect(() => {
		handleCanvasResize();
		window.addEventListener('resize', handleCanvasResize);
		return () => window.removeEventListener('resize', handleCanvasResize);
	}, [handleCanvasResize]);

	const startDraw = (e) => {
		setDrawing(true);
		const rect = canvasRef.current.getBoundingClientRect();
		const ctx = canvasRef.current.getContext('2d');
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = strokeWidth;
		ctx.lineCap = 'round';
		ctx.beginPath();
		ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
	};
	const moveDraw = (e) => {
		if (!drawing) return;
		const rect = canvasRef.current.getBoundingClientRect();
		const ctx = canvasRef.current.getContext('2d');
		ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
		ctx.stroke();
	};
	const endDraw = () => setDrawing(false);

	const clearSignature = () => {
		const ctx = canvasRef.current.getContext('2d');
		ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
		setSignaturePreview(null);
	};

	const saveSignaturePreview = () => {
		const dataUrl = canvasRef.current.toDataURL('image/png');
		setSignaturePreview(dataUrl);
		toast.success('Signature saved. Click a spot on the PDF to place it.');
		setPlacing(true);
	};

	const onPageLoad = (p) => {
		setPageDims({ width: p.width, height: p.height });
		setNumPages(p._pdfInfo?.numPages || numPages);
	};

	const onPdfClick = async (e) => {
		if (!placing || !signaturePreview) return;
		try {
			// Get click coordinates relative to page canvas
			const target = e.target.closest('canvas');
			if (!target) return;
			const rect = target.getBoundingClientRect();
			const xDisplay = e.clientX - rect.left;
			const yDisplay = e.clientY - rect.top;

			// Map display coords to PDF points
			const displayW = rect.width;
			const displayH = rect.height;
			const scaleX = pageDims.width / displayW;
			const scaleY = pageDims.height / displayH;
			const widthPdf = placingWidth * scaleX; // requested width in PDF points
			const xPdf = Math.max(0, xDisplay * scaleX);
			const yFromTopPdf = yDisplay * scaleY;
			const yPdf = Math.max(0, pageDims.height - yFromTopPdf - (widthPdf * 0.35)); // approx height factor

			setPlacePoint({ xPdf, yPdf });

			const form = new FormData();
			form.append('pdf', pdfFile);
			form.append('signatureDataUrl', signaturePreview);
			form.append('page', String(pageNumber));
			form.append('x', String(Math.round(xPdf)));
			form.append('y', String(Math.round(yPdf)));
			form.append('width', String(Math.round(widthPdf)));

			const { data } = await axios.post('/api/pdfs/stamp-signature', form, { headers: { 'Content-Type': 'multipart/form-data' } });
			toast.success('Signature applied. Download will start.');
			if (data.downloadUrl) {
				const link = document.createElement('a');
				link.href = data.downloadUrl;
				link.download = data.fileName || 'signed.pdf';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
			setPlacing(false);
		} catch (err) {
			console.error(err);
			toast.error(err.response?.data?.error || 'Failed to apply signature');
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold text-gray-900">E-Signatures</h1>
				<p className="text-gray-600">Upload a PDF, draw your signature, and click on the PDF to place it.</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left: tools */}
				<div className="card lg:col-span-1">
					<h2 className="text-lg font-semibold mb-3">1) Upload PDF</h2>
					<input type="file" accept="application/pdf" onChange={onPdfChange} className="block w-full text-sm" />

					<div className="mt-6">
						<h2 className="text-lg font-semibold mb-3">2) Draw Signature</h2>
						<div className="flex items-center gap-3 mb-2">
							<label className="text-sm">Color</label>
							<input type="color" value={strokeColor} onChange={(e)=>setStrokeColor(e.target.value)} />
							<label className="text-sm">Width</label>
							<input type="range" min="1" max="6" value={strokeWidth} onChange={(e)=>setStrokeWidth(parseInt(e.target.value))} />
						</div>
						<div className="border rounded-lg overflow-hidden bg-white">
							<canvas ref={canvasRef}
								onMouseDown={startDraw}
								onMouseMove={moveDraw}
								onMouseUp={endDraw}
								onMouseLeave={endDraw}
								className="w-full h-[200px]"
							/>
						</div>
						<div className="flex gap-3 mt-3">
							<button onClick={saveSignaturePreview} className="btn-primary">Save Signature</button>
							<button onClick={clearSignature} className="btn-secondary">Clear</button>
						</div>
						{signaturePreview && (
							<div className="mt-3">
								<p className="text-sm text-gray-600 mb-1">Saved Signature Preview</p>
								<img src={signaturePreview} alt="signature" className="h-16 rounded border" />
								<div className="mt-2">
									<label className="text-sm mr-2">Placing width (px display basis)</label>
									<input type="number" className="input-field w-28" value={placingWidth} onChange={(e)=>setPlacingWidth(parseInt(e.target.value)||180)} />
									<p className="text-xs text-gray-500">Click on the PDF preview to place the signature.</p>
								</div>
							</div>
						)}
					</div>
				</div>

				{/* Right: PDF preview */}
				<div className="card lg:col-span-2">
					<h2 className="text-lg font-semibold mb-3">3) PDF Preview</h2>
					{pdfFile ? (
						<div className="border rounded-lg overflow-auto" onClick={onPdfClick}>
							<Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
								<Page pageNumber={pageNumber} width={800} onLoadSuccess={onPageLoad} renderTextLayer={false} renderAnnotationLayer={false} />
							</Document>
						</div>
					) : (
						<p className="text-gray-500">Upload a PDF to preview and sign.</p>
					)}
					{numPages && (
						<div className="flex items-center gap-3 mt-3">
							<button className="btn-secondary" onClick={()=> setPageNumber(p=> Math.max(1, p-1))}>Prev</button>
							<span className="text-sm">Page {pageNumber} of {numPages}</span>
							<button className="btn-secondary" onClick={()=> setPageNumber(p=> Math.min(numPages, p+1))}>Next</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Signatures;
