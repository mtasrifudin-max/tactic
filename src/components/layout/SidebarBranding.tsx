import React from 'react';

export interface SidebarBrandingProps {
  isCollapsed: boolean;
  onClick?: () => void;
  className?: string;
}

export const SidebarBranding: React.FC<SidebarBrandingProps> = ({
  isCollapsed,
  onClick,
  className = ''
}) => {
  const content = (
    <div className={`relative flex items-center justify-center w-full h-full min-h-[44px] ${className}`}>
      {/* Collapsed State: TACTIC ICON (symbol only) */}
      <div
        className={`flex items-center justify-center transition-all duration-200 ease-in-out ${
          isCollapsed
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none absolute inset-0'
        }`}
        aria-hidden={!isCollapsed}
      >
        <img
          src="/assets/aistudio/TACTIC_ICON.png"
          alt="TACTIC Logo"
          className="w-9 h-9 max-w-[36px] max-h-[36px] object-contain select-none transition-transform duration-200 group-hover:scale-105"
          loading="eager"
        />
      </div>

      {/* Expanded State: TACTIC BANNER (full horizontal banner) */}
      <div
        className={`flex items-center justify-center w-full transition-all duration-200 ease-in-out ${
          !isCollapsed
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none absolute inset-0'
        }`}
        aria-hidden={isCollapsed}
      >
        <img
          src="/assets/aistudio/TACTIC_BANNER.png"
          alt="TACTIC Banner"
          className="w-[88%] max-w-[185px] max-h-10 h-auto object-contain select-none transition-transform duration-200 group-hover:scale-[1.02]"
          loading="eager"
        />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center justify-center py-1 cursor-pointer group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0070C0] rounded-lg transition-opacity"
        title="TACTIC - Task and Corrective Tracking Integrated Control"
        aria-label="TACTIC Home"
      >
        {content}
      </button>
    );
  }

  return content;
};

export default SidebarBranding;
