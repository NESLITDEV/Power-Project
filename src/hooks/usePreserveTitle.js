import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TITLE = "Power Auto";

export const usePreserveTitle = () => {
  const location = useLocation();

  useEffect(() => {
    // Set initial title
    document.title = TITLE;

    // Create a MutationObserver to watch for title changes
    const observer = new MutationObserver(() => {
      if (document.title !== TITLE) {
        document.title = TITLE;
      }
    });

    // Watch for changes to the title element
    const titleElement = document.querySelector("title");
    if (titleElement) {
      observer.observe(titleElement, {
        childList: true,
        characterData: true,
        subtree: true,
      });
    }

    // Also watch for new title elements (react-helmet-async creates new ones)
    const headObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === "TITLE") {
            // Immediately set our title
            document.title = TITLE;
            // And observe this new title element
            observer.observe(node, {
              childList: true,
              characterData: true,
              subtree: true,
            });
          }
        });
      });
    });

    // Watch the head element for new title elements
    const head = document.querySelector("head");
    if (head) {
      headObserver.observe(head, {
        childList: true,
        subtree: true,
      });
    }

    // Cleanup observers on unmount
    return () => {
      observer.disconnect();
      headObserver.disconnect();
    };
  }, []); // Only run once on mount

  // Also ensure title is correct after route changes
  useEffect(() => {
    document.title = TITLE;
  }, [location.pathname]);
};
