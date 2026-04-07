function Divider(props: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center py-12 ${props.className ?? ""}`}
      aria-hidden="true"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="text-white/30"
      >
        <path
          d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

Divider.displayName = "Divider";
export default Divider;
