import React, { useState } from 'react';
import {
  Wallet,
  Plus,
  Edit3,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { CryptoAsset } from '../../types/investment';
import { useMarketData } from '../../hooks/useMarketData';
import { formatToman, toPersianDigits } from '../../utils/formatters';
import { triggerHaptic } from '../../utils/haptics';
import { AddAssetModal } from './AddAssetModal';
import { EditAssetModal } from './EditAssetModal';
import { NobitexIntegrationCard } from '../crypto/NobitexIntegrationCard';

interface HoldingsManagerProps {
  cryptoAssets: CryptoAsset[];
  updateCryptoAssets: (assets: CryptoAsset[]) => void;
  addCryptoAsset: (asset: Omit<CryptoAsset, 'id'>) => void;
  editCryptoAsset: (id: string, updates: Partial<CryptoAsset>) => void;
  removeCryptoAsset: (id: string) => void;
  onNavigateToCalculator: () => void;
  onNavigateToMarket?: () => void;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const HoldingsManager: React.FC<HoldingsManagerProps> = ({
  cryptoAssets,
  updateCryptoAssets,
  addCryptoAsset,
  editCryptoAsset,
  removeCryptoAsset,
  onNavigateToCalculator,
  onNavigateToMarket,
  onNotify,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CryptoAsset | null>(null);

  const { combinedItems, totalMarketValueTomans } = useMarketData();

  // Find gold items in TSETMC holdings
  const goldItems = combinedItems.filter(
    (item) =>
      item.instrument.assetType === 'etf' ||
      item.instrument.symbol.includes('عیار') ||
      item.instrument.symbol.includes('طلا') ||
      item.instrument.symbol.includes('کهربا') ||
      item.instrument.symbol.includes('زر')
  );

  const totalCryptoValue = cryptoAssets.reduce(
    (sum, a) => sum + (a.currentHoldingValue || 0),
    0
  );

  return (
    <div className="space-y-4">
      
      {/* Tab Header Banner */}
      <div className="glass-card p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400">
              <Wallet className="w-4 h-4" />
            </div>
            <h2 className="text-base font-black text-slate-100">
              مدیریت موجودی دارایی‌های فعلی (Holdings)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            موجودی‌های قبلی طلا (صندوق‌های بورسی TSETMC) و ارزهای دیجیتال خود را مدیریت کنید.
          </p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            onNavigateToCalculator();
          }}
          className="self-stretch sm:self-auto py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gold-400 hover:text-gold-300 border border-gold-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all interactive-tap touch-target"
        >
          <span>مشاهده محاسبات خرید</span>
          <ArrowRight className="w-3.5 h-3.5 rotate-180" />
        </button>
      </div>

      {/* 1. TSETMC GOLD SECTION */}
      <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-950 border border-gold-500/40 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-gold-400 flex items-center justify-center font-bold text-lg">
              🥇
            </div>
            <div>
              <h3 className="text-base font-black text-slate-100">
                موجودی طلای بورسی <span className="gold-gradient-text">(صندوق‌های TSETMC)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                ارزش کل روز: {formatToman(totalMarketValueTomans)} تومان (بر اساس نرخ زنده بورس)
              </p>
            </div>
          </div>

          {onNavigateToMarket && (
            <button
              onClick={() => {
                triggerHaptic('light');
                onNavigateToMarket();
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-gold-300 border border-gold-500/40 text-xs font-bold transition-all interactive-tap flex items-center gap-1 shrink-0"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>مدیریت در بورس</span>
            </button>
          )}
        </div>

        {/* Gold Items Summary Cards */}
        {goldItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {goldItems.map((item) => (
              <div
                key={item.holding.id}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-gold-400">
                      {item.instrument.symbol}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-900 text-slate-400">
                      {toPersianDigits(item.holding.quantity)} واحد
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[160px] mt-0.5">
                    {item.instrument.name}
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs font-black text-gold-300 dir-ltr">
                    {formatToman(item.currentValueTomans)} ت
                  </div>
                  <div className="text-[10px] text-slate-500 dir-ltr">
                    نرخ: {formatToman(item.quote?.lastPriceTomans || 0)} ت
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center space-y-1.5">
            <span className="text-xs text-slate-300 block font-medium">
              هنوز صندوق طلایی (مانند عیار، طلا، کهربا) اضافه نکرده‌اید.
            </span>
            <span className="text-[11px] text-slate-500 block">
              از تب «بورس و طلا» نماد مورد نظر خود را اضافه کنید تا ارزش لحظه‌ای آن در سبد محاسبه شود.
            </span>
          </div>
        )}
      </div>

      {/* 2. NOBITEX API AUTO-SYNC CARD */}
      <NobitexIntegrationCard
        cryptoAssets={cryptoAssets}
        onAssetsUpdated={updateCryptoAssets}
        onNotify={onNotify}
      />

      {/* 3. CRYPTO SECTION */}
      <div className="glass-card p-4 sm:p-6 border border-slate-800 space-y-3.5">
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h3 className="text-base font-black text-slate-100">
                موجودی فعلی ارزهای دیجیتال
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              مجموع ارزش کریپتو: {formatToman(totalCryptoValue)} تومان
            </p>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 text-xs px-3.5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all interactive-tap touch-target shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن ارز جدید</span>
          </button>
        </div>

        {/* Crypto Items Grid / List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {cryptoAssets.map((asset) => (
            <div
              key={asset.id}
              onClick={() => {
                triggerHaptic('light');
                setEditingAsset(asset);
              }}
              className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/50 transition-all flex items-center justify-between gap-3 interactive-tap"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: asset.color }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-100 text-sm">{asset.symbol}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-900 border border-slate-700 text-slate-400 font-bold">
                      وزن: {toPersianDigits(asset.targetPercent)}٪
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate max-w-[130px]">
                    {asset.currentAmount !== undefined && asset.currentAmount > 0
                      ? `${toPersianDigits(asset.currentAmount.toFixed(4))} ${asset.symbol}`
                      : asset.name}
                  </div>
                </div>
              </div>

              {/* Balance & Edit Icon */}
              <div className="flex items-center gap-2">
                <div className="text-left">
                  <div className="text-xs font-black text-slate-200 dir-ltr">
                    {asset.currentHoldingValue > 0
                      ? `${formatToman(asset.currentHoldingValue)} ت`
                      : '۰ ت'}
                  </div>
                  {asset.unitPrice !== undefined && asset.unitPrice > 0 && (
                    <div className="text-[10px] text-slate-500 dir-ltr">
                      نرخ: {formatToman(asset.unitPrice)} ت
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-slate-900 text-slate-400">
                  <Edit3 className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAsset={addCryptoAsset}
      />

      <EditAssetModal
        asset={editingAsset}
        isOpen={Boolean(editingAsset)}
        onClose={() => setEditingAsset(null)}
        onSave={editCryptoAsset}
        onDelete={removeCryptoAsset}
      />

    </div>
  );
};
