import { config, footer as F } from "@/content/site";
import Logo from "../chrome/Logo";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div className="footer__brand">
          <Logo />
          <p className="footer__tag">{F.tagline}</p>
          <a href={config.phoneHref} className="footer__phone">
            {config.phone}
          </a>
        </div>
        <dl className="footer__facts">
          <div>
            <dt>{F.labels.email}</dt>
            <dd>
              <a href={`mailto:${config.email}`}>{config.email}</a>
            </dd>
          </div>
          <div>
            <dt>{F.labels.hours}</dt>
            <dd>{config.hours}</dd>
          </div>
          <div>
            <dt>{F.labels.license}</dt>
            <dd>{config.licenseNumber}</dd>
          </div>
          <div>
            <dt>{F.labels.area}</dt>
            <dd>{config.serviceArea.map((t) => t.name).join(" · ")}</dd>
          </div>
        </dl>
        <nav className="footer__links" aria-label={F.labels.links}>
          <p className="footer__h">{F.labels.links}</p>
          <ul>
            {F.quickLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="footer__base">
        <span>
          © {year} {config.businessName}
        </span>
        <span>{config.cityState}</span>
      </div>
    </footer>
  );
}
