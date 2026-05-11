export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title">
      {eyebrow ? <div className="hero-kicker">{eyebrow}</div> : null}
      <h2>{title}</h2>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}
