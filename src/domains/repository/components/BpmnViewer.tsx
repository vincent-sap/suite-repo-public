import { useEffect, useRef } from 'react';
import { BpmnVisualization, FitType } from 'bpmn-visualization';

interface BpmnViewerProps {
  xml: string;
  className?: string;
  style?: React.CSSProperties;
  disableNavigation?: boolean;
}

export function BpmnViewer({ xml, className, style, disableNavigation }: BpmnViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const vizRef = useRef<BpmnVisualization | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!vizRef.current) {
      vizRef.current = new BpmnVisualization({
        container: containerRef.current,
        navigation: { enabled: !disableNavigation },
      });
    }

    try {
      vizRef.current.load(xml, { fit: { type: FitType.Center, margin: 20 } });
    } catch (e) {
      console.error('BpmnViewer: failed to load XML', e);
    }
  }, [xml]);

  useEffect(() => {
    return () => {
      vizRef.current?.dispose();
      vizRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
}
