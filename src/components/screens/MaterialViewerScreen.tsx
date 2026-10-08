import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  FileText,
  AlertCircle,
  Loader2,
  BookOpen,
  Info,
  Sparkles,
  Columns,
  FileQuestion,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - Vite resolves ?url imports to the static asset path
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { AcademicMaterialRecord, Course, StudentProfile } from '../../types';
import { studentMaterialsService } from '../../services/studentMaterialsService';
import { PremiumDownloadModal } from '../student/PremiumDownloadModal';
import { StudentMaterialDetailModal } from '../student/StudentMaterialDetailModal';
import { analyticsTracker } from '../../services/analyticsTrackerService';

// Configure PDF.js worker once
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

interface MaterialViewerScreenProps {
  material?: AcademicMaterialRecord | null;
  materialId?: string | null;
  initialPage?: number;
  profile?: StudentProfile;
  onBack: () => void;
  onAskAITutor?: (course?: Course | string) => void;
}

/**
 * Individual PDF Page Canvas Renderer with IntersectionObserver lazy rendering
 * so multi-page university textbooks and handouts scroll smoothly on mobile & desktop.
 */
interface PdfPageCanvasProps {
  pdfDoc: any;
  pageNumber: number;
  scale: number;
  containerWidth: number;
  fitWidth: boolean;
  onPageVisible?: (pageNumber: number) => void;
}

const PdfPageCanvas: React.FC<PdfPageCanvasProps> = ({
  pdfDoc,
  pageNumber,
  scale,
  containerWidth,
  fitWidth,
  onPageVisible,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(pageNumber <= 2);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: Math.min(containerWidth - 16, 820),
    height: Math.round(Math.min(containerWidth - 16, 820) * 1.414),
  });

  // Track visibility for lazy rendering & active page indicator
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (entry.intersectionRatio >= 0.35) {
              onPageVisible?.(pageNumber);
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '400px 0px',
        threshold: [0.1, 0.35, 0.7],
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [pageNumber, onPageVisible]);

  // Render page onto canvas when visible or zoom/width changes
  useEffect(() => {
    if (!isVisible || !pdfDoc || !canvasRef.current) return;

    let renderTask: any = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        setIsRendering(true);
        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled || !canvasRef.current) return;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(280, containerWidth - 20);
        const baseScale = fitWidth
          ? (availableWidth / unscaledViewport.width) * scale
          : scale * 1.25;

        const viewport = page.getViewport({ scale: baseScale });
        const outputScale = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 3);

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        setPageDimensions({
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
        });

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        renderTask = page.render({
          canvasContext: context,
          transform,
          viewport,
        });

        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.warn(`PDF page ${pageNumber} render notice:`, err);
        }
      } finally {
        if (!isCancelled) {
          setIsRendering(false);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask && typeof renderTask.cancel === 'function') {
        try {
          renderTask.cancel();
        } catch {}
      }
    };
  }, [isVisible, pdfDoc, pageNumber, scale, containerWidth, fitWidth]);

  return (
    <div
      ref={wrapperRef}
      id={`venue-pdf-page-${pageNumber}`}
      style={{ minHeight: `${pageDimensions.height}px` }}
      className="relative mx-auto my-2.5 flex items-center justify-center bg-white rounded-lg shadow-xl border border-slate-300/80 overflow-hidden select-none"
    >
      <canvas ref={canvasRef} className="block max-w-full" />
      {(!isVisible || isRendering) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100/85 text-slate-600 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Rendering Page {pageNumber}...</span>
        </div>
      )}
      <div className="absolute bottom-2 right-2.5 px-2 py-0.5 rounded bg-slate-900/70 text-white text-[10px] font-mono backdrop-blur-xs pointer-events-none">
        Page {pageNumber}
      </div>
    </div>
  );
};

export const MaterialViewerScreen: React.FC<MaterialViewerScreenProps> = ({
  material: initialMaterial,
  materialId,
  initialPage,
  profile,
  onBack,
  onAskAITutor,
}) => {
  const [material, setMaterial] = useState<AcademicMaterialRecord | null>(
    initialMaterial || null
  );
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(
    !initialMaterial && Boolean(materialId)
  );
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [errorState, setErrorState] = useState<{
    code:
      | 'MATERIAL_NOT_FOUND'
      | 'STORAGE_FILE_MISSING'
      | 'PERMISSION_DENIED'
      | 'NETWORK_FAILURE'
      | 'PDF_LOAD_FAILURE'
      | 'AUTH_EXPIRED'
      | null;
    title: string;
    message: string;
  } | null>(null);

  // Viewer Mode & Content State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfRenderMode, setPdfRenderMode] = useState<'canvas' | 'native'>('canvas');
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [fitToWidth, setFitToWidth] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [textContent, setTextContent] = useState<string>('');
  const [imageObjectUrl, setImageObjectUrl] = useState<string | null>(null);

  // Modals
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [checkingDownload, setCheckingDownload] = useState<boolean>(false);

  const readerContainerRef = useRef<HTMLDivElement>(null);
  const viewerWrapperRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Measure reading container width for responsive Fit-to-Width PDF rendering
  useEffect(() => {
    const updateWidth = () => {
      if (readerContainerRef.current) {
        setContainerWidth(readerContainerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [isFullscreen, material]);

  // 1. Load material metadata if navigated directly via /materials/:materialId/view
  useEffect(() => {
    let isMounted = true;
    if (initialMaterial) {
      setMaterial(initialMaterial);
      setLoadingMetadata(false);
      return;
    }

    if (!materialId) {
      setErrorState({
        code: 'MATERIAL_NOT_FOUND',
        title: 'Material Not Found',
        message: 'No material identifier was provided to open in the VENUE Reader.',
      });
      setLoadingMetadata(false);
      return;
    }

    setLoadingMetadata(true);
    setErrorState(null);
    studentMaterialsService
      .getMaterialById(materialId)
      .then((rec) => {
        if (!isMounted) return;
        if (!rec) {
          setErrorState({
            code: 'MATERIAL_NOT_FOUND',
            title: 'Material Not Found',
            message:
              'This course material could not be found or is no longer active in the university repository.',
          });
        } else {
          setMaterial(rec);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setErrorState({
          code: 'NETWORK_FAILURE',
          title: 'Network Failure',
          message: 'Unable to retrieve material metadata. Please check your connection and try again.',
        });
      })
      .finally(() => {
        if (isMounted) setLoadingMetadata(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialMaterial, materialId]);

  // 2. Load the actual file stream when material is ready (lazy loaded ONLY for the opened material)
  const loadMaterialContent = useCallback(async () => {
    if (!material) return;

    const viewerType = studentMaterialsService.getViewerSupportType(
      material.fileName,
      material.mimeType
    );

    // Track view analytics
    analyticsTracker.trackMaterialView(
      material.id,
      material.title,
      material.courseCode,
      material.materialType
    );

    if (viewerType === 'unsupported') {
      // Do not pretend unsupported binary formats (e.g. DOCX/PPTX/XLSX) are natively viewable
      setLoadingFile(false);
      setErrorState(null);
      return;
    }

    setLoadingFile(true);
    setErrorState(null);

    try {
      const retrieval = await studentMaterialsService.retrieveMaterialFileBinary(material);

      if (!retrieval.ok || !retrieval.arrayBuffer) {
        if (retrieval.errorCode === 'AUTH_EXPIRED') {
          setErrorState({
            code: 'AUTH_EXPIRED',
            title: 'Authentication Expired',
            message:
              retrieval.errorMessage ||
              'Your session has expired. Please sign in again to access course materials.',
          });
          return;
        }
        if (retrieval.errorCode === 'PERMISSION_DENIED') {
          setErrorState({
            code: 'PERMISSION_DENIED',
            title: 'Permission Denied',
            message:
              retrieval.errorMessage ||
              'You do not have permission to view this course material.',
          });
          return;
        }
        if (retrieval.errorCode === 'STORAGE_FILE_MISSING' || retrieval.status === 404) {
          setErrorState({
            code: 'STORAGE_FILE_MISSING',
            title: 'Storage File Missing',
            message:
              retrieval.errorMessage ||
              'The uploaded file for this material could not be found in storage.',
          });
          return;
        }
        throw new Error(
          retrieval.errorMessage || `Server responded with status ${retrieval.status}`
        );
      }

      const arrayBuffer = retrieval.arrayBuffer;

      if (viewerType === 'pdf') {
        const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(pdfBlob);
        setPdfBlobUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return blobUrl;
        });

        // CRITICAL FOR ORIGINAL FONT & EQUATION FIDELITY:
        // Supply PDF.js with standard_fonts (FoxitSerif/TimesNewRoman, FoxitSymbol, FoxitFixed, LiberationSans),
        // cmaps, and wasm so unembedded PDF fonts, mathematical symbols, italics, bold weights,
        // subscripts/superscripts, and tables match the original PDF 1:1 instead of falling back to browser sans-serif.
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          standardFontDataUrl: '/pdfjs/standard_fonts/',
          cMapUrl: '/pdfjs/cmaps/',
          cMapPacked: true,
          wasmUrl: '/pdfjs/wasm/',
          useSystemFonts: false,
          disableFontFace: false,
        });
        const loadedPdf = await loadingTask.promise;
        const total = loadedPdf.numPages || 1;
        setPdfDoc(loadedPdf);
        setNumPages(total);
        const startPage =
          typeof initialPage === 'number' && Number.isFinite(initialPage) && initialPage >= 1
            ? Math.min(total, Math.max(1, Math.round(initialPage)))
            : 1;
        setCurrentPage(startPage);
        setPageInput(String(startPage));
        if (startPage > 1) {
          setTimeout(() => {
            const pageEl = document.getElementById(`venue-pdf-page-${startPage}`);
            if (pageEl) {
              pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 220);
        }
      } else if (viewerType === 'image') {
        const blob = new Blob([arrayBuffer], {
          type: retrieval.contentType || material.mimeType || 'image/png',
        });
        const objUrl = URL.createObjectURL(blob);
        setImageObjectUrl(objUrl);
      } else if (viewerType === 'text') {
        const decoder = new TextDecoder('utf-8');
        setTextContent(decoder.decode(arrayBuffer));
      }
    } catch (err: any) {
      console.error('Error loading material in VENUE Reader:', err);
      const isPdfErr =
        viewerType === 'pdf' &&
        (err?.name === 'InvalidPDFException' ||
          err?.message?.toLowerCase().includes('pdf'));
      setErrorState({
        code: isPdfErr ? 'PDF_LOAD_FAILURE' : 'NETWORK_FAILURE',
        title: isPdfErr ? 'PDF Loading Failure' : 'Unable to Load Material',
        message: isPdfErr
          ? 'The PDF document could not be decoded or appears to be corrupted.'
          : err?.message || 'A network error occurred while loading the document stream.',
      });
    } finally {
      setLoadingFile(false);
    }
  }, [material]);

  useEffect(() => {
    loadMaterialContent();
    return () => {
      if (imageObjectUrl) {
        URL.revokeObjectURL(imageObjectUrl);
      }
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [loadMaterialContent]);

  // Handle Page Navigation
  const jumpToPage = (targetPage: number) => {
    if (!numPages) return;
    const clamped = Math.max(1, Math.min(numPages, targetPage));
    setCurrentPage(clamped);
    setPageInput(String(clamped));
    const pageEl = document.getElementById(`venue-pdf-page-${clamped}`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePageVisible = useCallback((pageNum: number) => {
    setCurrentPage(pageNum);
    setPageInput(String(pageNum));
  }, []);

  // Handle Zoom
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(2.5, Number((prev + 0.2).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.6, Number((prev - 0.2).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomScale(1.0);
    setFitToWidth(true);
  };

  // Toggle Fullscreen / Expanded Reading Mode
  const toggleFullscreen = () => {
    if (!viewerWrapperRef.current) {
      setIsFullscreen((prev) => !prev);
      return;
    }
    if (!document.fullscreenElement) {
      viewerWrapperRef.current
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => setIsFullscreen((prev) => !prev));
    } else {
      document
        .exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => setIsFullscreen(false));
    }
  };

  // Handle Gated Premium Download
  const handleDownloadClick = async () => {
    if (!material || checkingDownload) return;
    setCheckingDownload(true);
    try {
      const result = await studentMaterialsService.requestMaterialDownload(
        material,
        profile?.uid
      );
      if (result.requiresPremium) {
        setShowPremiumModal(true);
      }
    } finally {
      setCheckingDownload(false);
    }
  };

  const viewerType = material
    ? studentMaterialsService.getViewerSupportType(material.fileName, material.mimeType)
    : 'pdf';
  const fileBadge = material
    ? studentMaterialsService.getFileTypeBadge(material.fileName, material.mimeType)
    : { label: 'FILE', bgColor: 'bg-slate-800', textColor: 'text-slate-300', borderColor: 'border-slate-700' };
  const uploaderName =
    material && typeof material.uploadedBy === 'object'
      ? material.uploadedBy.name || material.uploadedBy.email || 'University Faculty'
      : material?.uploaderRole === 'lecturer'
      ? 'Course Lecturer'
      : 'University Repository';

  return (
    <div
      ref={viewerWrapperRef}
      className={`flex flex-col w-full bg-slate-950 text-slate-100 ${
        isFullscreen ? 'fixed inset-0 z-50 h-screen' : 'min-h-[calc(100vh-4px)]'
      }`}
    >
      {/* Top Sticky Reader Header Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-5 py-2.5 flex items-center justify-between gap-2 shadow-md">
        {/* Left: Back Button + Material Title & Course Metadata */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <button
            id="material-viewer-back-btn"
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
            title="Back to Course Materials"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>

          {material && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {material.courseCode && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-500/15 text-sky-400 border border-blue-500/30 shrink-0">
                    {material.courseCode}
                  </span>
                )}
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                  {material.materialType}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${fileBadge.bgColor} ${fileBadge.textColor} ${fileBadge.borderColor}`}
                >
                  {fileBadge.label}
                </span>
                <span className="hidden md:inline text-[11px] text-slate-400 truncate">
                  • {uploaderName} • {studentMaterialsService.formatDate(material.createdAt)}
                </span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5">
                {material.title}
              </h1>
            </div>
          )}
        </div>

        {/* Right: Reader Actions (Info, AI Tutor, Download Gate) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {material && (
            <button
              type="button"
              onClick={() => setShowInfoModal(true)}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer"
              title="Material Details"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          {material && onAskAITutor && (
            <button
              type="button"
              onClick={() => onAskAITutor(material.courseCode)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Ask AI Tutor about this course"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Ask AI Tutor</span>
            </button>
          )}

          {material && (
            <button
              id="material-viewer-download-btn"
              type="button"
              onClick={handleDownloadClick}
              disabled={checkingDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/35 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Download original file (VENUE Premium)"
            >
              {checkingDownload ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
              ) : (
                <Crown className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Download</span>
            </button>
          )}
        </div>
      </header>

      {/* Secondary Interactive Toolbar for PDF & Image Reading Controls */}
      {!loadingMetadata && !loadingFile && !errorState && material && (viewerType === 'pdf' || viewerType === 'image') && (
        <div className="sticky top-[53px] z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/90 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Page Navigation (for PDFs) */}
          {viewerType === 'pdf' && numPages > 0 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => jumpToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const parsed = parseInt(pageInput, 10);
                  if (!isNaN(parsed)) jumpToPage(parsed);
                }}
                className="flex items-center gap-1 text-xs font-medium text-slate-300"
              >
                <span>Page</span>
                <input
                  type="text"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={() => {
                    const parsed = parseInt(pageInput, 10);
                    if (!isNaN(parsed)) jumpToPage(parsed);
                    else setPageInput(String(currentPage));
                  }}
                  className="w-11 px-1.5 py-0.5 text-center bg-slate-950 border border-slate-700 rounded text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  aria-label="Current page number"
                />
                <span className="text-slate-400 font-mono">/ {numPages}</span>
              </form>

              <button
                type="button"
                onClick={() => jumpToPage(currentPage + 1)}
                disabled={currentPage >= numPages}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {typeof initialPage === 'number' && initialPage >= 1 && (
                <button
                  type="button"
                  onClick={() => jumpToPage(initialPage)}
                  className="ml-1.5 px-2 py-0.5 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 text-[11px] font-medium cursor-pointer transition-colors"
                  title={`Jump to cited page ${initialPage}`}
                >
                  Cited p. {initialPage}
                </button>
              )}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>VENUE In-App Reader • Free Reading Mode</span>
            </div>
          )}

          {/* Zoom & Fit-to-Width & Fullscreen Controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomScale <= 0.6}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleResetZoom}
              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-sky-300 font-mono text-[11px] font-semibold hover:border-slate-700 cursor-pointer"
              title="Reset Zoom to 100%"
            >
              {Math.round(zoomScale * 100)}%
            </button>

            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomScale >= 2.5}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {viewerType === 'pdf' && (
              <>
                <button
                  type="button"
                  onClick={() => setFitToWidth((prev) => !prev)}
                  className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                    fitToWidth
                      ? 'bg-blue-600/20 text-sky-300 border-blue-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                  title="Fit document page to screen width"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Fit Width</span>
                </button>

                {pdfBlobUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setPdfRenderMode((prev) => (prev === 'canvas' ? 'native' : 'canvas'))
                    }
                    className={`hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                      pdfRenderMode === 'native'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                    }`}
                    title="Toggle between VENUE Page Reader and Native PDF Viewer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{pdfRenderMode === 'native' ? 'Page Reader' : 'Native PDF'}</span>
                  </button>
                )}
              </>
            )}

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white cursor-pointer transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expanded Fullscreen Reading Mode'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Large Reading Area */}
      <div
        ref={readerContainerRef}
        className="flex-1 w-full max-w-5xl mx-auto px-1.5 sm:px-4 py-3 overflow-y-auto flex flex-col"
      >
        {/* 1. Loading State */}
        {(loadingMetadata || loadingFile) && (
          <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-sky-400 shadow-lg">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Opening Course Material in VENUE Reader...
              </h2>
              <p className="text-xs text-slate-400">
                {material?.title
                  ? `Loading "${material.title}" (${material.fileName || 'Document'})`
                  : 'Preparing high-resolution academic reading view...'}
              </p>
            </div>
          </div>
        )}

        {/* 2. Error State */}
        {!loadingMetadata && !loadingFile && errorState && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-rose-500/30 shadow-xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {errorState.code}
                </span>
                <h2 className="text-base font-bold text-white">{errorState.title}</h2>
                <p className="text-xs text-slate-300 leading-relaxed">{errorState.message}</p>
              </div>
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Course
                </button>
                <button
                  type="button"
                  onClick={loadMaterialContent}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. PDF In-App Reader (Preserves 100% original PDF fonts, equations, tables, margins & layout) */}
        {!loadingMetadata && !loadingFile && !errorState && material && viewerType === 'pdf' && (
          <>
            {pdfRenderMode === 'native' && pdfBlobUrl ? (
              <div className="flex-1 w-full min-h-[78vh] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                <iframe
                  src={`${pdfBlobUrl}#page=${currentPage}&view=${fitToWidth ? 'FitH' : 'Fit'}`}
                  title={material.title}
                  className="w-full h-[80vh] border-0 bg-white"
                />
              </div>
            ) : (
              pdfDoc && (
                <div className="w-full flex flex-col items-center pb-16">
                  {Array.from({ length: numPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <PdfPageCanvas
                      key={pageNum}
                      pdfDoc={pdfDoc}
                      pageNumber={pageNum}
                      scale={zoomScale}
                      containerWidth={containerWidth}
                      fitWidth={fitToWidth}
                      onPageVisible={handlePageVisible}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}

        {/* 4. Image In-App Viewer (JPG, PNG, WEBP) */}
        {!loadingMetadata && !loadingFile && !errorState && material && viewerType === 'image' && imageObjectUrl && (
          <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto bg-slate-900/60 rounded-2xl border border-slate-800">
            <img
              src={imageObjectUrl}
              alt={material.title}
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: 'top center',
              }}
              className="max-w-full h-auto rounded-lg shadow-2xl transition-transform duration-150"
            />
          </div>
        )}

        {/* 5. Plain Text In-App Reader (.txt) */}
        {!loadingMetadata && !loadingFile && !errorState && material && viewerType === 'text' && (
          <div className="flex-1 w-full max-w-4xl mx-auto p-5 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <pre className="text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-wrap break-words leading-relaxed">
              {textContent || 'Document is empty.'}
            </pre>
          </div>
        )}

        {/* 6. Honest Unsupported File Format State (DOCX, PPTX, XLSX) */}
        {!loadingMetadata && !loadingFile && !errorState && material && viewerType === 'unsupported' && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <FileQuestion className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <span
                  className={`inline-block text-xs font-mono font-bold px-2.5 py-0.5 rounded-md border ${fileBadge.bgColor} ${fileBadge.textColor} ${fileBadge.borderColor}`}
                >
                  {fileBadge.label} Format
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  In-App Preview Not Supported for {fileBadge.label} Files
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <strong className="text-white">{material.fileName}</strong> is stored in its original{' '}
                  <span className="font-mono text-sky-300">{fileBadge.label}</span> format. VENUE currently supports direct in-app reading for <strong className="text-white">PDF</strong>, <strong className="text-white">Image (JPG/PNG)</strong>, and <strong className="text-white">Text</strong> documents without converting or altering your original file.
                </p>
              </div>

              {material.description && (
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Material Description
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {material.description}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Course Materials
                </button>

                <button
                  type="button"
                  onClick={handleDownloadClick}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                >
                  <Crown className="w-4 h-4" />
                  <span>Download Original File (Premium)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Premium Download Gate Modal */}
      <PremiumDownloadModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        material={material}
      />

      {/* Material Metadata Details Modal */}
      {showInfoModal && material && (
        <StudentMaterialDetailModal
          material={material}
          onClose={() => setShowInfoModal(false)}
          onOpenViewer={() => setShowInfoModal(false)}
        />
      )}
    </div>
  );
};
