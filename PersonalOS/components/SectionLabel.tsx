export function SectionLabel({ num, text }: { num: string; text: string }) {
  return (
    <div className="section-label">
      <span className="sl-num">{num}</span>
      <span className="sl-text">{text}</span>
    </div>
  );
}
