'use client';

export function LoadingSkeleton() {
  return (
    <div style={{ padding: '0 16px' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 12,
            padding: 20,
            background: 'var(--ios-secondary-bg)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              className="skeleton-shimmer"
              style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div
                className="skeleton-shimmer"
                style={{ height: 18, borderRadius: 6, width: '60%', marginBottom: 8 }}
              />
              <div
                className="skeleton-shimmer"
                style={{ height: 14, borderRadius: 4, width: '40%' }}
              />
            </div>
          </div>

          {/* Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div
                className="skeleton-shimmer"
                style={{ height: 32, borderRadius: 8, width: 120, marginBottom: 6 }}
              />
              <div
                className="skeleton-shimmer"
                style={{ height: 12, borderRadius: 4, width: 80 }}
              />
            </div>
            <div
              className="skeleton-shimmer"
              style={{ height: 36, borderRadius: 12, width: 90 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
