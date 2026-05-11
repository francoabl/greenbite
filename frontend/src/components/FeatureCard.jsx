export default function FeatureCard({ title, copy }) {
  return (
    <div className="feature-card">
      <h4>{title}</h4>
      <p>{copy}</p>
    </div>
  );
}
