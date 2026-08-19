type InsightsCoverImageProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
};

export default function InsightsCoverImage({
  src,
  alt,
  className = '',
  priority = false,
}: InsightsCoverImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={className}
    />
  );
}
