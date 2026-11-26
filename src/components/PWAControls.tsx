import React, { useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // Suppress install button when already running in installed standalone mode
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    setShowGuide(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={
          compact
            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-orange-400'
            : 'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900/95 border border-orange-500/60 hover:bg-stone-800 hover:border-orange-400 text-stone-100 text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-orange-400'
        }
      >
        {isInstallable ? (
          <Download className="w-4 h-4 text-orange-400" />
        ) : (
          <Smartphone className="w-4 h-4 text-orange-400" />
        )}
        <span>{compact ? 'Install' : 'Install di HP (PWA)'}</span>
      </button>

      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-guide-title"
        >
          <div className="w-full max-w-sm rounded-xl bg-stone-900 border border-stone-700 p-6 shadow-2xl text-left">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 id="pwa-guide-title" className="font-display text-xl font-bold text-stone-100">
                {isIOS ? 'Pasang di iPhone / iPad' : 'Pasang di Android'}
              </h3>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 cursor-pointer"
                aria-label="Tutup panduan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <ol className="space-y-2.5 text-sm text-stone-300 list-decimal list-inside">
                <li>
                  Buka aplikasi ini di browser <strong className="text-stone-100">Safari</strong>.
                </li>
                <li>
                  Ketuk tombol <strong className="text-stone-100">Bagikan (Share)</strong> di bilah bawah.
                </li>
                <li>
                  Pilih <strong className="text-stone-100">Tambah ke Layar Utama (Add to Home Screen)</strong>.
                </li>
              </ol>
            ) : (
              <ol className="space-y-2.5 text-sm text-stone-300 list-decimal list-inside">
                <li>
                  Buka tautan aplikasi ini di <strong className="text-stone-100">Google Chrome Android</strong> (bukan tampilan preview dalam iframe).
                </li>
                <li>
                  Ketuk menu titik tiga (<strong className="text-stone-100">⋮</strong>) di pojok kanan atas Chrome.
                </li>
                <li>
                  Pilih <strong className="text-stone-100">Tambahkan ke layar utama</strong> atau <strong className="text-stone-100">Instal aplikasi</strong>.
                </li>
              </ol>
            )}

            {!isIOS && !isAndroid && (
              <p className="mt-3 text-xs text-stone-400">
                Di desktop Chrome/Edge, Anda juga bisa klik ikon instal di ujung kanan bilah alamat browser.
              </p>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full min-h-[44px] rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold cursor-pointer transition-colors"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      className="fixed bottom-3 right-3 z-50 inline-flex items-center gap-2 rounded-lg bg-amber-950/95 border border-amber-500/70 px-3 py-2 text-xs font-medium text-amber-100 shadow-lg pointer-events-none"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span>Mode Offline · Bermain dengan data tersimpan</span>
    </div>
  );
};
