import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface BackupRestoreProps {
  onExport: () => void;
  onImport: (json: string) => void;
  onResetToDefaults: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  onExport,
  onImport,
  onResetToDefaults,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-card p-5 sm:p-6 border border-slate-800 space-y-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-100">
            پشتیبان‌گیری و ذخیره‌سازی داده‌ها
          </h3>
          <p className="text-xs text-slate-400">
            اطلاعات شما در حافظه محلی گوشی ذخیره می‌شود. می‌توانید از اطلاعات خود فایل خروجی بگیرید.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Export Backup Button */}
        <button
          onClick={onExport}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 flex items-center gap-3 text-right transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-200">
              دانلود فایل پشتیبان (Backup)
            </div>
            <div className="text-[11px] text-slate-400">
              ذخیره تمامی دارایی‌ها و تنظیمات در قالب فایل JSON
            </div>
          </div>
        </button>

        {/* Import Backup Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 flex items-center gap-3 text-right transition-all cursor-pointer group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-slate-200">
              بازیابی از فایل پشتیبان (Restore)
            </div>
            <div className="text-[11px] text-slate-400">
              بارگذاری فایل بکاپ و جایگزینی داده‌ها
            </div>
          </div>
        </button>
      </div>

      {/* Reset to Factory Defaults */}
      <div className="pt-2">
        <button
          onClick={() => setShowResetModal(true)}
          className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>بازنشانی کلی به مقادیر پیش‌فرض اولیه (Factory Reset)</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-right">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-100 text-center mb-2">
              بازنشانی به مقادیر پیش‌فرض
            </h3>

            <p className="text-xs text-slate-300 text-center mb-5 leading-relaxed">
              آیا مطمئن هستید؟ تمام داده‌های ذخیره‌شده، دارایی‌های ثبت‌شده و تاریخچه پاک شده و درصدهای پیش‌فرض تصویر اولیه بازگردانده می‌شوند.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  onResetToDefaults();
                  setShowResetModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer transition-all"
              >
                بله، بازنشانی شود
              </button>
              <button
                onClick={() => setShowResetModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer transition-all"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
