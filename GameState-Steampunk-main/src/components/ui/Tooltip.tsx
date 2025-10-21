import React from 'react';

interface TooltipProps {
  /** Inhalt, der innerhalb des Tooltips angezeigt wird. */
  content: React.ReactNode;
  /** Optionaler zusätzliche Klassenname für den Tooltip-Container. */
  className?: string;
  /** Das Element, das den Tooltip auslöst. */
  children: React.ReactElement;
}

/**
 * Eine einfache, zugängliche Tooltip-Komponente mit Hover-, Focus- und Touch-Unterstützung.
 */
const Tooltip: React.FC<TooltipProps> = ({ content, className = '', children }) => {
  const [visible, setVisible] = React.useState(false);
  const tooltipId = React.useId();
  const touchTimeout = React.useRef<number | undefined>(undefined);

  const show = React.useCallback(() => {
    setVisible(true);
  }, []);

  const hide = React.useCallback(() => {
    setVisible(false);
  }, []);

  const handleTouchStart = React.useCallback(() => {
    window.clearTimeout(touchTimeout.current);
    touchTimeout.current = window.setTimeout(() => {
      setVisible(true);
    }, 150);
  }, []);

  const handleTouchEnd = React.useCallback(() => {
    window.clearTimeout(touchTimeout.current);
    setVisible(false);
  }, []);

  if (!React.isValidElement(children)) {
    return null;
  }

  const mergedProps = {
    onMouseEnter: (event: React.MouseEvent) => {
      children.props.onMouseEnter?.(event);
      show();
    },
    onMouseLeave: (event: React.MouseEvent) => {
      children.props.onMouseLeave?.(event);
      hide();
    },
    onFocus: (event: React.FocusEvent) => {
      children.props.onFocus?.(event);
      show();
    },
    onBlur: (event: React.FocusEvent) => {
      children.props.onBlur?.(event);
      hide();
    },
    onTouchStart: (event: React.TouchEvent) => {
      children.props.onTouchStart?.(event);
      handleTouchStart();
    },
    onTouchEnd: (event: React.TouchEvent) => {
      children.props.onTouchEnd?.(event);
      handleTouchEnd();
    },
    onTouchCancel: (event: React.TouchEvent) => {
      children.props.onTouchCancel?.(event);
      handleTouchEnd();
    },
    'aria-describedby': visible ? tooltipId : undefined,
  } as const;

  return (
    <span className="relative inline-flex">
      {React.cloneElement(children, mergedProps)}
      <span
        role="tooltip"
        id={tooltipId}
        className={`pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-max -translate-x-1/2 rounded-md border border-yellow-500/40 bg-black/90 px-3 py-2 text-xs text-yellow-100 shadow-xl transition-opacity duration-150 ${
          visible ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        hidden={!visible}
      >
        {content}
      </span>
    </span>
  );
};

export default Tooltip;
