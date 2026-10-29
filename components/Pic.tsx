import blur from "@/content/blur.json";

type Props = {
  base: string; // e.g. /img/keys/K02-cold-room  (expects -900/-1600/-2400 .avif/.webp)
  alt: string;
  sizes?: string;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
  widths?: number[];
  w?: number;
  h?: number;
  style?: React.CSSProperties;
};

/** Responsive AVIF/WebP picture for the pre-optimized stills in /public/img. */
export default function Pic({ base, alt, sizes = "100vw", className, imgClassName, loading = "lazy", widths = [900, 1600, 2400], w = 1600, h = 900, style }: Props) {
  const name = base.split("/").pop()!;
  const b = (blur as Record<string, string>)[name];
  const srcset = (ext: string) => widths.map((x) => `${base}-${x}.${ext} ${x}w`).join(", ");
  return (
    <picture className={className}>
      <source type="image/avif" srcSet={srcset("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcset("webp")} sizes={sizes} />
      <img
        src={`${base}-${widths[Math.min(1, widths.length - 1)]}.webp`}
        alt={alt}
        loading={loading}
        decoding="async"
        width={w}
        height={h}
        className={imgClassName}
        style={{ ...(b ? { backgroundImage: `url(${b})`, backgroundSize: "cover" } : {}), ...style }}
      />
    </picture>
  );
}
