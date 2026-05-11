export default function OrderPlanCard({ title, people, price, bullets, onOrder, disabled }) {
  return (
    <article className="plan-card order-card">
      <div className="plan-card-content">
        <div className="plan-meta">{people} personas</div>
        <div>
          <h3>{title}</h3>
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
        <button className="btn primary" type="button" onClick={onOrder} disabled={disabled}>
          Pedir ahora
        </button>
      </div>
    </article>
  );
}
