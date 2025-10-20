"use client";

import { useEffect, useRef } from "react";

/**
 * Custom React hook for embedding TradingView widgets into a React application.
 *
 * This hook handles the lifecycle of TradingView widget scripts, including:
 * - Creating and mounting the widget container
 * - Loading the TradingView script dynamically
 * - Cleaning up resources when the component unmounts
 * - Preventing duplicate script loaded
 *
 * @param scriptUrl - The URL of the TradingView widget script to load
 * @param config - Configuration object for the TradingView widget
 * @param height - Height of the widget container in pixels (default: 600)
 *
 * @return A ref to attach to the container div element
 *
 * @example
 * ```tsx
 * const MyTradingChar = () => {
 *      const containerRef = useTradingViewWidget(
 *          "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js",
 *          { symbol: ["AAPL", "GOOGL"], colorTheme: "dark"},
 *          400
 *      )
 * }
 **/

const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600,
) => {
  // create a ref to hold the container div element
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;

    if (!el) return;

    // Reset container, then re-initialize
    el.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.width = "100%";
    widgetDiv.style.height = `${height}px`;
    el.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.innerHTML = JSON.stringify(config);
    el.appendChild(script);

    // Cleanup function runs when component unmounts or dependencies change
    return () => {
      if (el) el.innerHTML = "";
    };
  }, [scriptUrl, config, height]);

  // Return the ref for the cosumer to attach to their container element
  return containerRef;
};

export default useTradingViewWidget;
