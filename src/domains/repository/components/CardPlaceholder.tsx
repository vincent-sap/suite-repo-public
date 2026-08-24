interface CardPlaceholderProps {
  width: number;
  height: number;
}

export function CardPlaceholder({ width, height }: CardPlaceholderProps) {
  return (
    <div
      style={{
        border: '2px solid var(--sapSelectedColor, #0064d9)',
        backgroundColor: 'color-mix(in srgb, var(--sapSelectedColor, #0064d9) 5%, transparent)',
        borderRadius: 0,
        width,
        height,
        minHeight: 'var(--card-min-height)',
        boxSizing: 'border-box',
      }}
    />
  );
}
