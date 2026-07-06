import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Printer, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { downloadBase64File } from '../utils/download';

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: string; // Base64 data string
  title: string;
}

export default function DocumentViewer({ isOpen, onClose, documentData, title }: DocumentViewerProps) {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!documentData) return null;

  const isBase64 = documentData.startsWith('data:');

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleDownload = () => {
    const matches = documentData.match(/^data:(image\/[a-z]+|pdf|application\/[a-z\-]+);base64,/);
    const ext = matches ? matches[1].split('/')[1] || 'png' : 'png';
    const filename = `${title.toLowerCase().replace(/\s+/g, '_')}_document.${ext}`;
    downloadBase64File(documentData, filename);
  };

  const handlePrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              @page { size: auto; margin: 10mm; }
              body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: white; font-family: sans-serif; }
              .container { text-align: center; max-width: 100%; max-height: 100%; }
              img { max-width: 100%; max-height: 90vh; object-fit: contain; border: 1px solid #ddd; padding: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
              h2 { font-size: 16px; color: #333; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${title}</h2>
              <img src="${documentData}" />
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 400);
              }
            </script>
          </body>
        </html>
      `);
      doc.close();
    }

    // Clean up iframe
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 5000);
  };

  // Drag handlers for navigating zoomed images
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-between bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 text-white overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
            <div className="flex flex-col">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest">Digital Document Viewer</span>
              <h3 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-tight truncate max-w-xs sm:max-w-lg">
                {title}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                title="Reset View"
                className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Viewer Area */}
          <div 
            className="flex-1 my-4 relative flex items-center justify-center overflow-hidden rounded-2xl bg-slate-900/40 border border-slate-900 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {isBase64 ? (
              <motion.div
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                transition={{ type: isDragging ? 'just' : 'spring', stiffness: 200, damping: 25 }}
                className="max-w-[90%] max-h-[95%] select-none transition-transform duration-150"
              >
                <img
                  src={documentData}
                  alt={title}
                  className="max-w-full max-h-[70vh] sm:max-h-[75vh] object-contain rounded-lg shadow-2xl pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            ) : (
              <div className="text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl max-w-sm">
                <p className="text-amber-500 text-2xl mb-2">📄</p>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Physical Copy Only</h4>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  This document was submitted in person as a physical paper document and is held by the warden.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between border-t border-slate-800 pt-4 shrink-0">
            {/* Zoom / Rotate Controls */}
            {isBase64 ? (
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-xl">
                <button
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition cursor-pointer"
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-3 text-xs font-mono font-bold text-slate-300 select-none">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition cursor-pointer"
                  disabled={scale >= 4}
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-5 bg-slate-800 mx-1"></div>
                <button
                  onClick={handleRotate}
                  title="Rotate 90°"
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 transition cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
            ) : <div />}

            {/* Print / Download buttons */}
            {isBase64 ? (
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  Print Doc
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 transition cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Save / Download
                </button>
              </div>
            ) : (
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider hover:bg-slate-850 transition cursor-pointer"
              >
                Close Viewer
              </button>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
