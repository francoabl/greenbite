export default function OrderPlanCard({ title, people, price, bullets, onOrder, disabled }) {
  return (
    <article className="plan-card order-card">
      <div className="plan-meta">{people} personas</div>
      <div>
        <h3>{title}</h3>
        <div className="plan-price">{price}</div>
      </div>
      <ul>
        {bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button className="btn primary" type="button" onClick={onOrder} disabled={disabled}>
        Pedir ahora
      </button>
    </article>
  );
}
