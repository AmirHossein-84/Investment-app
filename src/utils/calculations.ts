import { AppSettings, CalculatedCryptoBuy, CalculationResult, CryptoAsset, GoldHolding } from '../types/investment';

/**
 * Waterfilling / iterative rebalancing algorithm for buy-only allocation.
 * Guarantees that:
 * 1. No buy amount is negative (buy-only, no forced selling).
 * 2. Total allocated equals totalBudget (up to rounding).
 * 3. Weights converge towards target ratios as closely as possible.
 */
export function calculateRebalancedBuys(
  assets: { id: string; targetWeight: number; currentValue: number }[],
  totalBudget: number
): { id: string; suggestedBuy: number }[] {
  if (totalBudget <= 0) {
    return assets.map((a) => ({ id: a.id, suggestedBuy: 0 }));
  }

  const n = assets.length;
  if (n === 0) return [];

  // Normalize target weights
  const totalWeight = assets.reduce((sum, a) => sum + Math.max(0, a.targetWeight), 0);
  if (totalWeight <= 0) {
    // If no valid weights, split equally
    const equalShare = totalBudget / n;
    return assets.map((a) => ({ id: a.id, suggestedBuy: equalShare }));
  }

  const normalized = assets.map((a) => ({
    ...a,
    weight: Math.max(0, a.targetWeight) / totalWeight,
    buy: 0,
    locked: false,
  }));

  let remainingBudget = totalBudget;
  let activeAssets = [...normalized];

  // Iterative waterfilling
  for (let iteration = 0; iteration < n; iteration++) {
    const activeWeightSum = activeAssets.reduce((sum, a) => sum + a.weight, 0);
    if (activeWeightSum <= 0) break;

    const currentTotalValue = activeAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const targetTotalValue = currentTotalValue + remainingBudget;

    let hasOverweight = false;

    for (const asset of activeAssets) {
      const idealTargetValue = targetTotalValue * (asset.weight / activeWeightSum);
      const rawBuy = idealTargetValue - asset.currentValue;

      if (rawBuy < 0) {
        // Asset already has more than its target share in this subset
        asset.buy = 0;
        asset.locked = true;
        hasOverweight = true;
      }
    }

    if (hasOverweight) {
      // Re-filter active assets and re-allocate remaining budget to underweight ones
      activeAssets = normalized.filter((a) => !a.locked);
      if (activeAssets.length === 0) break;
    } else {
      // All remaining active assets can take positive buys
      for (const asset of activeAssets) {
        const idealTargetValue = targetTotalValue * (asset.weight / activeWeightSum);
        asset.buy = Math.max(0, idealTargetValue - asset.currentValue);
      }
      break;
    }
  }

  // Ensure total sum matches totalBudget exactly by scaling if slight difference
  const totalAllocated = normalized.reduce((sum, a) => sum + a.buy, 0);
  if (totalAllocated > 0 && Math.abs(totalAllocated - totalBudget) > 1) {
    const factor = totalBudget / totalAllocated;
    normalized.forEach((a) => {
      a.buy = Math.round(a.buy * factor);
    });
  }

  return normalized.map((a) => ({
    id: a.id,
    suggestedBuy: Math.max(0, a.buy),
  }));
}

/**
 * Direct allocation (simple percentage split of the new budget).
 */
export function calculateDirectBuys(
  assets: { id: string; targetWeight: number }[],
  totalBudget: number
): { id: string; suggestedBuy: number }[] {
  if (totalBudget <= 0) {
    return assets.map((a) => ({ id: a.id, suggestedBuy: 0 }));
  }

  const totalWeight = assets.reduce((sum, a) => sum + Math.max(0, a.targetWeight), 0);
  if (totalWeight <= 0) {
    const share = totalBudget / assets.length;
    return assets.map((a) => ({ id: a.id, suggestedBuy: share }));
  }

  return assets.map((a) => ({
    id: a.id,
    suggestedBuy: Math.round((Math.max(0, a.targetWeight) / totalWeight) * totalBudget),
  }));
}

/**
 * Main portfolio investment calculator.
 */
export function calculatePortfolioAllocation(
  inputAmount: number,
  settings: AppSettings,
  cryptoAssets: CryptoAsset[],
  goldHolding: GoldHolding
): CalculationResult {
  const totalInputAmount = Math.max(0, inputAmount);
  // Default: 30% savings
  const totalSavingsAmount = Math.round(totalInputAmount * (settings.savingsPercent / 100));

  let goldBuyAmount = 0;
  let cryptoBuyAmount = 0;

  const currentGoldVal = goldHolding.currentHoldingValue || 0;
  const currentCryptoTotalVal = cryptoAssets.reduce(
    (sum, c) => sum + (c.currentHoldingValue || 0),
    0
  );

  if (settings.calculationMode === 'rebalance') {
    // Rebalance Gold vs Crypto
    const topLevelAllocations = calculateRebalancedBuys(
      [
        { id: 'gold', targetWeight: settings.goldPercent, currentValue: currentGoldVal },
        { id: 'crypto', targetWeight: settings.cryptoPercent, currentValue: currentCryptoTotalVal },
      ],
      totalSavingsAmount
    );

    goldBuyAmount = topLevelAllocations.find((a) => a.id === 'gold')?.suggestedBuy || 0;
    cryptoBuyAmount = topLevelAllocations.find((a) => a.id === 'crypto')?.suggestedBuy || 0;
  } else {
    // Direct percentage split
    const totalTopPercent = settings.goldPercent + settings.cryptoPercent || 100;
    goldBuyAmount = Math.round(totalSavingsAmount * (settings.goldPercent / totalTopPercent));
    cryptoBuyAmount = Math.round(totalSavingsAmount * (settings.cryptoPercent / totalTopPercent));
  }

  // Allocate Crypto among individual crypto assets
  let cryptoBuysList: { id: string; suggestedBuy: number }[] = [];

  if (settings.calculationMode === 'rebalance') {
    cryptoBuysList = calculateRebalancedBuys(
      cryptoAssets.map((c) => ({
        id: c.id,
        targetWeight: c.targetPercent,
        currentValue: c.currentHoldingValue || 0,
      })),
      cryptoBuyAmount
    );
  } else {
    cryptoBuysList = calculateDirectBuys(
      cryptoAssets.map((c) => ({
        id: c.id,
        targetWeight: c.targetPercent,
      })),
      cryptoBuyAmount
    );
  }

  const buyMap = new Map(cryptoBuysList.map((b) => [b.id, b.suggestedBuy]));

  const finalCryptoTotal = currentCryptoTotalVal + cryptoBuyAmount;

  const calculatedCryptoBuys: CalculatedCryptoBuy[] = cryptoAssets.map((asset) => {
    const buy = buyMap.get(asset.id) || 0;
    const current = asset.currentHoldingValue || 0;
    const finalVal = current + buy;
    const finalPercent = finalCryptoTotal > 0 ? (finalVal / finalCryptoTotal) * 100 : asset.targetPercent;

    return {
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      targetPercent: asset.targetPercent,
      currentHoldingValue: current,
      suggestedBuy: buy,
      finalHoldingValue: finalVal,
      finalPercent,
      color: asset.color,
    };
  });

  const totalCryptoBuySuggested = calculatedCryptoBuys.reduce(
    (sum, c) => sum + c.suggestedBuy,
    0
  );

  const newTotalPortfolioValue =
    currentGoldVal + currentCryptoTotalVal + goldBuyAmount + totalCryptoBuySuggested;

  return {
    totalInputAmount,
    totalSavingsAmount,
    goldBuyAmount,
    cryptoBuyAmount,
    cryptoBuys: calculatedCryptoBuys,
    totalCryptoBuySuggested,
    newTotalPortfolioValue,
  };
}
