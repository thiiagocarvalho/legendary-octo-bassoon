import Link from 'next/link';

export function PilatesProBrand({ href, compact = false }: { href?: string; compact?: boolean }) {
  const content = <><span aria-hidden className="brand-mark"><i/><i/><i/></span>{!compact ? <span>PilatesProCRM</span> : null}</>;
  const className = "brand-logo";
  return href ? <Link className={className} href={href}>{content}</Link> : <span className={className}>{content}</span>;
}
