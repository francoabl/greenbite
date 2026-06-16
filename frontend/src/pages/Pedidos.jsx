import BrandHeader from "../components/BrandHeader.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import usePedidos from "../hooks/usePedidos.js";
import { useState } from "react";
import { Link } from "react-router-dom";
import OrderPlanCard from "../components/OrderPlanCard.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import useAuth from "../hooks/useAuth.js";

const plans = [
  {
    title: "Suscripcion Clara",
    people: "1",
    price: "CLP 18.990",
    plan: 1,
    description: "Ideal para individuos que buscan mantener una dieta fresca y balanceada con porciones perfectas.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    bullets: ["Verduras de temporada", "Proteina vegetal", "Guia de cocina"]
  },
  {
    title: "Suscripcion Nido",
    people: "2",
    price: "CLP 32.990",
    plan: 2,
    description: "Perfecto para parejas. Recetas balanceadas creadas por chefs y nutricionistas.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
    bullets: ["4 combinaciones semanales", "Frutas organicas", "Salsas artesanales"]
  },
  {
    title: "Suscripcion Raiz",
    people: "4",
    price: "CLP 59.990",
    plan: 4,
    description: "La solucion completa para familias que desean alimentarse sano de forma rapida y variada.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80",
    bullets: ["Plan familiar", "Pack de granos", "Soporte nutricional"]
  }
];

export default function Pedidos() {
  const { user } = useAuth();
  const { pedidos, loading, error, createPedido } = usePedidos(user?.id);
  const [orderStatus, setOrderStatus] = useState("idle");
  const [orderMessage, setOrderMessage] = useState("");
  const [modalState, setModalState] = useState({ isOpen: false, planData: null });

  const handleOrderClick = (planData) => {
    if (!user?.id) {
      setOrderStatus("error");
      setOrderMessage("Inicia sesion para crear un pedido.");
      return;
    }
    setModalState({ isOpen: true, planData });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, planData: null });
  };

  const confirmOrder = async () => {
    const { planData } = modalState;
    closeModal();
    
    setOrderStatus("loading");
    setOrderMessage("");
    try {
      await createPedido({ userId: user.id, plan: planData.plan });
      setOrderStatus("ready");
      setOrderMessage("Pedido creado correctamente.");
    } catch (err) {
      setOrderStatus("error");
      setOrderMessage(err.response?.data?.message || "No se pudo crear el pedido");
    }
  };

  return (
    <div className="page">
      <BrandHeader />
      <section className="container section">
        <SectionTitle
          eyebrow="Pedidos"
          title="Tu flujo de pedidos en un solo panel"
          subtitle="Cada pedido vive en el microservicio de pedidos con su propia base."
        />
        <div className="order-panel">
          <h3>Elige tu suscripcion</h3>
          <p>
            {user?.nombre ? (
              <>Sesion activa: <strong>{user.nombre}</strong></>
            ) : (
              <>
                No hay sesion activa. <Link to="/login">Inicia sesion</Link>.
              </>
            )}
          </p>
          <div className="order-grid">
            {plans.map((plan) => (
              <OrderPlanCard
                key={plan.title}
                title={plan.title}
                people={plan.people}
                price={plan.price}
                bullets={plan.bullets}
                onOrder={() => handleOrderClick(plan)}
                disabled={orderStatus === "loading"}
              />
            ))}
          </div>
          {orderMessage ? (
            <div className={`alert ${orderStatus === "error" ? "alert-error" : "alert-success"}`}>
              {orderMessage}
            </div>
          ) : null}
        </div>
        <div className="recent-panel">
          <h3>Pedidos recientes</h3>
          {loading ? <div className="status-note">Cargando...</div> : null}
          {error ? <div className="alert alert-error">{error}</div> : null}
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Plan</th>
                <th>Estado</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.id.slice(0, 8)}</td>
                  <td>{pedido.plan}</td>
                  <td>{pedido.status}</td>
                  <td>${pedido.total?.toLocaleString("es-CL")}</td>
                </tr>
              ))}
              {!loading && pedidos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="table-empty">
                    {user?.id
                      ? "Aun no tienes pedidos. Elige una suscripcion arriba."
                      : "Inicia sesion para ver tus pedidos."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
      
      <ConfirmModal 
        isOpen={modalState.isOpen}
        planData={modalState.planData}
        onClose={closeModal}
        onConfirm={confirmOrder}
      />
    </div>
  );
}
