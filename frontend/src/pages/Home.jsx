import BrandHeader from "../components/BrandHeader.jsx";
import FeatureCard from "../components/FeatureCard.jsx";
import Footer from "../components/Footer.jsx";
import PlanCard from "../components/PlanCard.jsx";
import SectionTitle from "../components/SectionTitle.jsx";
import { Link } from "react-router-dom";

const plans = [
  {
    title: "Suscripcion Clara",
    people: "1",
    price: "CLP 18.990",
    description: "Ideal para individuos que buscan mantener una dieta fresca y balanceada con porciones perfectas.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    bullets: ["Verduras de temporada", "Proteina vegetal", "Guia de cocina"]
  },
  {
    title: "Suscripcion Nido",
    people: "2",
    price: "CLP 32.990",
    description: "Perfecto para parejas. Recetas balanceadas creadas por chefs y nutricionistas.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
    bullets: ["4 combinaciones semanales", "Frutas organicas", "Salsas artesanales"]
  },
  {
    title: "Suscripcion Raiz",
    people: "4",
    price: "CLP 59.990",
    description: "La solucion completa para familias que desean alimentarse sano de forma rapida y variada.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80",
    bullets: ["Plan familiar", "Pack de granos", "Soporte nutricional"]
  }
];

const features = [
  {
    title: "Origen visible",
    copy: "Cada caja incluye productores, zona y fecha de cosecha."
  },
  {
    title: "Ritmo flexible",
    copy: "Pausa o cambia tu plan en segundos desde la plataforma."
  },
  {
    title: "BFF inteligente",
    copy: "Respuestas unificadas para una experiencia sin friccion."
  },
  {
    title: "Data per Service",
    copy: "Pedidos y usuarios viven en bases separadas y seguras."
  }
];

export default function Home() {
  return (
    <div className="page">
      <BrandHeader />

      <main className="container hero">
        <div className="hero-grid">
          <div>
            <div className="hero-kicker">Suscripcion organica</div>
            <h1 className="hero-title">Cestas que respetan el tiempo de la tierra.</h1>
            <p className="hero-text">
              GreenBite conecta productores locales con hogares que buscan
              alimentacion limpia. Planes segun tu ritmo, con transparencia total.
            </p>
            <div className="cta-group">
              <a className="btn primary" href="#planes">
                Ver planes
              </a>
              <Link className="btn" to="/pedidos">
                Crear pedido
              </Link>
            </div>
          </div>
          <div className="hero-card">
            <span className="badge">Caja viva</span>
            <h3>Mix de temporada</h3>
            <p>
              9 a 12 ingredientes frescos, pensados para 5 recetas sin desperdicio.
            </p>
            <div className="step">Entrega en 24 hrs en Santiago</div>
            <div className="step">Refrigeracion eco-friendly</div>
          </div>
        </div>
      </main>

      <section className="container section" id="planes">
        <SectionTitle
          eyebrow="Planes"
          title="Suscripciones que se adaptan a tu mesa"
          subtitle="Tres niveles, misma trazabilidad. Elige el tamano y cambia cuando quieras."
        />
        <div className="plan-grid">
          {plans.map((plan) => (
            <PlanCard key={plan.title} {...plan} />
          ))}
        </div>
      </section>

      <section className="container section" id="proceso">
        <SectionTitle
          eyebrow="Proceso"
          title="Del campo al plato en cuatro movimientos"
          subtitle="Microservicios aislados para usuarios y pedidos, coordinados por un BFF rapido."
        />
        <div className="steps">
          <div className="step">1. Productores cargan lotes disponibles</div>
          <div className="step">2. Tu plan activa una orden automatica</div>
          <div className="step">3. Armado en hub refrigerado</div>
          <div className="step">4. Entrega y trazabilidad en vivo</div>
        </div>
      </section>

      <section className="container section" id="ecosistema">
        <SectionTitle
          eyebrow="Ecosistema"
          title="Tecnologia limpia para comida real"
          subtitle="Una plataforma pensada para crecer sin acoplar servicios ni datos."
        />
        <div className="feature-grid">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
