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
    // Early return if container doesn't exist
    if (!containerRef.current) return;

    // Check if thw widget has already been loaded to prevent duplicate initialization
    // This uses a custom data attribute to track loading state
    if (containerRef.current.dataset.loaded) return;

    // Create the widget cotainer with specified height
    // TradingView widget expect a specific cotainer strucutre
    containerRef.current.innerHTML = `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`;

    // Create the script element that will load the TradingView widget
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true; // Load script asynchronously to avoid blocking

    // Pass the configuration to the TradingView widget
    script.innerHTML = JSON.stringify(config);

    // Append the script to the container to trigger widget loading
    containerRef.current.appendChild(script);

    // Mark the container as loaded to prevent re-initialization
    containerRef.current.dataset.loaded = "true";

    // Cleanup function runs when component unmounts or dependencies change
    return () => {
      if (containerRef.current) {
        // Clear the container contents to remove the widget
        containerRef.current.innerHTML = "";
        // Remvoe the loaded flag to allow re-initialization if needed
        delete containerRef.current.dataset.loaded;
      }
    };
  }, [scriptUrl, config, height]); // Re-run effect if any of these dependencies change

  // Return the ref for the cosumer to attach to their container element
  return containerRef;
};

export default useTradingViewWidget;
