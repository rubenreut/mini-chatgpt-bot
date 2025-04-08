import React from 'react';
import styles from './Skeleton.module.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  className,
}) => {
  const skeletonClasses = [
    styles.skeleton,
    styles[variant],
    styles[`animation-${animation}`],
    className
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return <div className={skeletonClasses} style={style} aria-hidden="true" />;
};

// Commonly used skeleton patterns
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'> & { lines?: number }> = ({
  lines = 1,
  ...props
}) => {
  return (
    <div className={styles.textLines}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          width={i === lines - 1 && lines > 1 ? '80%' : '100%'}
          {...props}
        />
      ))}
    </div>
  );
};

export const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant'>> = (props) => {
  return <Skeleton variant="circular" width={40} height={40} {...props} />;
};

export const SkeletonCard: React.FC<SkeletonProps> = (props) => {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton variant="rectangular" height={200} {...props} />
      <div className={styles.cardContent}>
        <Skeleton variant="text" width="60%" />
        <SkeletonText lines={3} />
      </div>
    </div>
  );
};

export default Skeleton;