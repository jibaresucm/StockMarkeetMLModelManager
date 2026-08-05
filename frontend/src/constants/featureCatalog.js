
export const FEATURE_CATALOG = {
  "Fear / Sentiment": {
    "FEAR_ENERGY_Z_X": {
      label: "Fear Energy Z-Score",
      description: "Absolute diff sum of VIX normalized over window, indicates fear energy/changes",
      hasWindows: true,
      defaultWindows: [3, 10],
    },
    "FEAR_DIFF_X": {
      label: "Fear Diff (EMA)",
      description: "EMA of VIX diff over window, indicates fear direction",
      hasWindows: true,
      defaultWindows: [7, 20],
    },
    "FEAR_RANK_X": {
      label: "Fear Rank (Percentile)",
      description: "Percentile rank of VIX over last X days",
      hasWindows: true,
      defaultWindows: [30, 100],
    },
  },

  "Trend": {
    "DCP": {
      label: "Day Channel Position",
      description: "Close position within daily high-low range",
      hasWindows: false,
    },
    "ADX_X": {
      label: "ADX",
      description: "Trend strength from talib, higher means a more defined trend",
      hasWindows: true,
      defaultWindows: [5, 10],
    },
    "ADX_ACCEL_X": {
      label: "ADX Acceleration",
      description: "Acceleration of trend force (ADX), indicates if market is reinforcing trend",
      hasWindows: true,
      defaultWindows: [10, 20],
    },
    "DIST_SMA_X": {
      label: "Distance from SMA",
      description: "Distance from Simple Moving Average to close, indicates general trend direction",
      hasWindows: true,
      defaultWindows: [20, 80, 120],
    },
    "KAUFMAN_ER": {
      label: "Kaufman Efficiency Ratio",
      description: "Net change divided by noise, measures how efficient the move is",
      hasWindows: false,
    },
    "HURST_X": {
      label: "Hurst Exponent",
      description: "Series persistence, above 0.5 trending and below 0.5 mean reverting",
      hasWindows: true,
      defaultWindows: [10, 20],
    },
    "ROC": {
      label: "Rate of Change",
      description: "Daily percentage return",
      hasWindows: false,
    },
    "DAY_RETURNS": {
      label: "Day Returns (Close/Open)",
      description: "Intraday return, close over open, above 1 means the session closed up",
      hasWindows: false,
    },
  },

  "Volume": {
    "RVOL_X": {
      label: "Relative Volume",
      description: "Volume against its own mean over the last X days",
      hasWindows: true,
      defaultWindows: [10, 40],
    },
    "RELATIVE_VOLUME_Z_X": {
      label: "Relative Volume Z-Score",
      description: "Volume relative to EMA, z-scored to detect unusual volume",
      hasWindows: true,
      defaultWindows: [7, 20],
    },
    "VOLUME_RANK_X": {
      label: "Volume Rank",
      description: "Percentile rank of volume over last X days",
      hasWindows: true,
      defaultWindows: [20, 80],
    },
    "VOLUME_FORCE_X": {
      label: "Volume Force",
      description: "Log returns weighted by relative volume, indicates directional conviction",
      hasWindows: true,
      defaultWindows: [20, 40],
    },
    "VPIN_DIRECTIONAL_X": {
      label: "VPIN Directional",
      description: "Net buy/sell imbalance normalized, 1 all buying and -1 all selling",
      hasWindows: true,
      defaultWindows: [20],
    },
    "AMIHUD_ILLIQUIDITY_X": {
      label: "Amihud Illiquidity",
      description: "Illiquidity ratio, how much the price moves per dollar traded",
      hasWindows: true,
      defaultWindows: [20],
    },
    "VT_ACCELERATION_Z_X": {
      label: "VT Acceleration Z-Score",
      description: "Z-score of price volume trend acceleration, detects strength anomalies",
      hasWindows: true,
      defaultWindows: [10],
    },
  },

  "Volatility": {
    "VOLATILITY_RATIO": {
      label: "Volatility Ratio (ATR3/ATR20)",
      description: "Ratio of short-term to long-term ATR, detects sudden volatility changes",
      hasWindows: false,
    },
    "VOLATILITY_COMPRESSION": {
      label: "Volatility Compression",
      description: "SMA5 / max volatility over 60 days, detects compressed ranges",
      hasWindows: false,
    },
    "YANG_ZHANG_X": {
      label: "Yang-Zhang Volatility",
      description: "Volatility estimator using the full OHLC candle, handles gaps",
      hasWindows: true,
      defaultWindows: [20],
    },
    "CORWIN_SCHULTZ_Z_X": {
      label: "Corwin-Schultz Spread (Z)",
      description: "Bid-ask spread estimated from high-low ranges, z-scored",
      hasWindows: true,
      defaultWindows: [20],
    },
  },

  "Signals": {
    "MFF_Z_X": {
      label: "Money Flow Force Z-Score",
      description: "Z-scored money flow force, detects unusual buying/selling pressure",
      hasWindows: true,
      defaultWindows: [5, 10, 20],
    },
    "RGM_Z": {
      label: "Relative Gap Momentum",
      description: "Z-scored gap momentum, indicates acceleration in overnight gaps",
      hasWindows: false,
    },
    "IDS_SHOCK": {
      label: "Inside Day Shock",
      description: "Inside day detection combined with relative volume shock",
      hasWindows: false,
    },
    "WIN_RATE": {
      label: "Win Rate",
      description: "Ratio of winning days recently, indicates trend continuation/exhaustion",
      hasWindows: false,
    },
  },
}

// Build the full dataset dict matching Datasets.py getFullDatasetDict()
export function getFullDatasetFeatures() {
  const features = {}
  for (const category of Object.values(FEATURE_CATALOG)) {
    for (const [key, config] of Object.entries(category)) {
      features[key] = config.hasWindows ? [...config.defaultWindows] : true
    }
  }
  return features
}

export function findFeatureConfig(key) {
  for (const category of Object.values(FEATURE_CATALOG)) {
    if (category[key]) return category[key]
  }
  return null
}

export function columnToFeature(column) {
  for (const category of Object.values(FEATURE_CATALOG)) {
    for (const [key, config] of Object.entries(category)) {
      if (!config.hasWindows && column === key) return key
      if (config.hasWindows) {
        const prefix = key.slice(0, -1)
        if (column.startsWith(prefix) && /^\d+$/.test(column.slice(prefix.length))) return key
      }
    }
  }
  return null
}
