import { ConnectionNetwork } from './ConnectionNetwork';
import { DirectoryMotion } from './DirectoryMotion';

export function ConnectedHero() {
  return (
    <section
      className="connected-hero directory-container"
      aria-labelledby="directory-title"
    >
      <div className="hero-copy">
        <h1 id="directory-title">
          One Link.
          <br />
          <span>
            Endless
            <br />
            Connections.
          </span>
        </h1>
        <p className="hero-description">
          Bringing brands and people closer, one connection at a time.
        </p>
        <a className="connection-cta" href="#connections">
          Explore Connections <span aria-hidden="true">→</span>
        </a>
      </div>
      <div className="hero-network-wrap">
        <ConnectionNetwork />
        <DirectoryMotion />
      </div>
    </section>
  );
}
