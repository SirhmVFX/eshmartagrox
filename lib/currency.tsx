"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrencyRates, CurrencyRate } from "@/lib/firestore";

const NGN_RATE: CurrencyRate = {
    id: "ngn",
    code: "NGN",
    symbol: "₦",
    name: "Nigerian Naira",
    rateFromNGN: 1,
    active: true,
};

const STORAGE_KEY = "ea_currency";

interface CurrencyContextValue {
    rates: CurrencyRate[];                        // all available rates (including NGN)
    selected: CurrencyRate;                       // currently active currency
    setSelected: (rate: CurrencyRate) => void;
    format: (ngnAmount: number) => string;        // convert + format a NGN price
    loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [rates, setRates] = useState<CurrencyRate[]>([NGN_RATE]);
    const [selected, setSelectedState] = useState<CurrencyRate>(NGN_RATE);
    const [loading, setLoading] = useState(true);

    // Load rates from Firestore once
    useEffect(() => {
        getCurrencyRates()
            .then(data => {
                const all = [NGN_RATE, ...data.filter(r => r.code !== "NGN")];
                setRates(all);

                // Restore previously chosen currency from localStorage
                try {
                    const saved = localStorage.getItem(STORAGE_KEY);
                    if (saved) {
                        const match = all.find(r => r.code === saved);
                        if (match) setSelectedState(match);
                    }
                } catch { }
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const setSelected = useCallback((rate: CurrencyRate) => {
        setSelectedState(rate);
        try { localStorage.setItem(STORAGE_KEY, rate.code); } catch { }
    }, []);

    const format = useCallback((ngnAmount: number): string => {
        const converted = ngnAmount * selected.rateFromNGN;
        // Use fewer decimal places for larger units, more for small ones (like USD cents)
        const decimals = converted >= 1 ? 2 : 4;
        return `${selected.symbol}${converted.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        })}`;
    }, [selected]);

    return (
        <CurrencyContext.Provider value={{ rates, selected, setSelected, format, loading }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
    return ctx;
}
