const words = ['CONNECT.', 'DISCOVER.', 'ENGAGE.', 'GROW.'];

// Decorative, fixed-size CSS loop: no timers or repeated screen-reader announcements.
export function AnimatedWords() {
  return (
    <span className="rotating-words" aria-hidden="true">
      {words.map((word, index) => (
        <span className={`rotating-word word-${index}`} key={word}>
          {word}
        </span>
      ))}
    </span>
  );
}
