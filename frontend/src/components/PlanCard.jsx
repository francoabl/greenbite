export default function PlanCard({ title, price, people, bullets, description, image }) {
  return (
    <article className="plan-card">
      {image && (
        <div className="plan-card-image-wrapper">
          <img src={image} alt={title} className="plan-card-image" />
        </div>
      )}
      <div className="plan-card-content">
        <div className="plan-meta">{people} personas</div>
        <div>
          <h3>{title}</h3>
          {description && <p className="plan-description">{description}</p>}
          <div className="plan-price">{price}</div>
        </div>
        <ul className="plan-bullets">
          {bullets.map((item) => (
            <li key={item}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
