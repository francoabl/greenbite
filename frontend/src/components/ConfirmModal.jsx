import "../styles/modal.css";

export default function ConfirmModal({ isOpen, onClose, onConfirm, planData }) {
  if (!isOpen || !planData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content expanded">
        <div className="modal-image-col">
          <img src={planData.image} alt={planData.title} className="modal-img" />
          <div className="modal-img-overlay"></div>
        </div>
        
        <div className="modal-details-col">
          <span className="modal-badge">{planData.people} {planData.people === "1" ? "persona" : "personas"}</span>
          <h3 className="modal-title">{planData.title}</h3>
          
          <p className="modal-description">{planData.description}</p>
          
          <div className="modal-includes">
            <h4>¿Qué incluye?</h4>
            <ul>
              {planData.bullets.map((bullet, idx) => (
                <li key={idx}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="modal-price-row">
            <span className="modal-price-label">Total mensual:</span>
            <span className="modal-price-value">{planData.price}</span>
          </div>

          <div className="modal-actions-separated">
            <button className="btn outline" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn primary block" onClick={onConfirm}>
              Confirmar Suscripción
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
