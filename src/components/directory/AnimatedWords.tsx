const words = ['Brands.', 'Experiences.', 'Connections.', 'Possibilities.'];

// CSS owns the loop: no timers, hydration changes, or repeated announcements.
export function AnimatedWords() {
  return (
    <p className="hero-headline">
      <span className="sr-only">
        One place to discover brands, experiences, connections, and
        possibilities.
      </span>
      <span aria-hidden="true">
        One place to discover
        <span className="rotating-words">
          {words.map((word, index) => (
            <span className={`rotating-word word-${index}`} key={word}>
              {word}
            </span>
          ))}
        </span>
      </span>
    </p>
  );
}
