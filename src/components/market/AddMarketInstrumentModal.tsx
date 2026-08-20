import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Check, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { SearchInstrumentResult } from '../../services/marketData/types';
import { marketDataProvider } from '../../services/marketData';
import { parseNumberInput, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';

interface AddMarketInstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (
    instrument: SearchInstrumentResult,
    quantity: number,
    averageBuyPriceTomans?: number
  ) => void;
}

export const AddMarketInstrumentModal: React.FC<AddMarketInstrumentModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchInstrumentResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<SearchInstrumentResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [averageBuyPrice, setAverageBuyPrice] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  const debounceTimerRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedInstrument(null);
      setQuantity('');
      setAverageBuyPrice('');
      setSearchError(null);
    }
  }, [isOpen]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setSelectedInstrument(null);
    setSearchError(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await marketDataProvider.searchInstruments(query);
        setSearchResults(results);
        if (results.length === 0) {
          setSearchError('نمادی با این نام در بورس تهران (TSETMC) یافت نشد.');
        }
      } catch (err) {
        setSearchError('خطا در برقراری ارتباط با سامانه TSETMC.');
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelectInstrument = (inst: SearchInstrumentResult) => {
    triggerHaptic('light');
    setSelectedInstrument(inst);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstrument) return;

    const parsedQty = parseFloat(quantity) || 0;
    if (parsedQty <= 0) return;

    const parsedPrice = parseNumberInput(averageBuyPrice);

    triggerHaptic('success');
    onAdd(selectedInstrument, parsedQty, parsedPrice > 0 ? parsedPrice : undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border-t sm:border border-slate-700 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl text-right overflow-hidden animate-slideUp max-h-[90vh] flex flex-col">
        
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-gold-400 border border-gold-500/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">
                افزودن دارایی بورسی و طلا (TSETMC)
              </h3>
              <p className="text-[11px] text-slate-400">
                جستجوی نماد در بورس تهران و دریافت خودکار قیمت روز
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all interactive-tap touch-target"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
          
          {/* 1. Search Input */}
          <div>
            <label className="block text-slate-300 font-bold mb-1.5">
              جستجوی نماد یا نام شرکت / صندوق (مانند: عیار، طلا، کهربا، اهرم، فولاد)
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="مثلاً: عیار یا طلا..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-400 font-bold text-sm"
                autoFocus
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </div>
            </div>
          </div>

          {/* Quick preset suggestions */}
          {!searchQuery && !selectedInstrument && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">نمادهای محبوب و صندوق‌های طلا:</span>
              <div className="flex flex-wrap gap-1.5">
                {['عیار', 'طلا', 'کهربا', 'زر', 'گوهر', 'اهرم', 'فولاد'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => handleSearchChange(sym)}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all interactive-tap font-bold text-[11px]"
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results List */}
          {searchResults.length > 0 && !selectedInstrument && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-2xl bg-slate-950 p-2 border border-slate-800">
              <span className="text-[11px] text-slate-400 font-bold px-2 block mb-1">
                نتایج جستجو در TSETMC:
              </span>
              {searchResults.map((item) => (
                <div
                  key={item.insCode}
                  onClick={() => handleSelectInstrument(item)}
                  className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-gold-500/50 flex items-center justify-between gap-2 cursor-pointer transition-all interactive-tap"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-100 text-sm text-gold-400">
                        {item.symbol}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400">
                        {item.assetType === 'etf' ? 'صندوق ETF / طلا' : 'سهم بورسی'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[280px]">
                      {item.name}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-gold-500/20 text-gold-300 hover:bg-gold-500/30 text-xs font-bold shrink-0"
                  >
                    انتخاب
                  </button>
                </div>
              ))}
            </div>
          )}

          {searchError && !isSearching && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Selected Instrument Confirmation & Quantity Input */}
          {selectedInstrument && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-gold-500/40 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-base text-gold-400">
                      {selectedInstrument.symbol}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                      انتخاب شد ✓
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {selectedInstrument.name}
                  </div>
                  <div className="text-[10px] text-slate-500 dir-ltr text-right mt-0.5">
                    کد TSETMC: {selectedInstrument.insCode}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInstrument(null)}
                  className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1"
                >
                  تغییر نماد
                </button>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  تعداد واحد / برگه دارایی <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="مثلاً: ۲۸۰"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-400 font-black text-base dir-ltr"
                />
              </div>

              {/* Optional Average Purchase Price */}
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">
                  میانگین قیمت خرید هر واحد به تومان (اختیاری جهت محاسبه سود/زیان)
                </label>
                <input
                  type="text"
                  value={averageBuyPrice}
                  onChange={(e) => setAverageBuyPrice(e.target.value)}
                  placeholder="مثلاً: ۳۵,۰۰۰"
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-400 font-bold text-sm dir-ltr"
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-3 border-t border-slate-800 shrink-0">
            <button
              type="submit"
              disabled={!selectedInstrument || !quantity || parseFloat(quantity) <= 0}
              className={`flex-1 py-3.5 rounded-2xl font-black text-xs transition-all interactive-tap touch-target ${
                selectedInstrument && parseFloat(quantity) > 0
                  ? 'bg-gradient-to-r from-amber-400 via-gold-500 to-yellow-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              افزودن به سبد دارایی‌ها
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs interactive-tap touch-target"
            >
              انصراف
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
