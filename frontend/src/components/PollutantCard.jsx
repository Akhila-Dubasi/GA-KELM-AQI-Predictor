export default function PollutantCard({ title, value }) {
  return (
    <div className="card">
      <h4>{title}</h4>
      <h2>{Math.round(value)}</h2>
    </div>
  );
}