const githubOrgUrl = "https://github.com/RegionallyFamous";
const desktopRepoUrl = "https://github.com/RegionallyFamous/SwanSong-Desktop";
const coreRepoUrl = "https://github.com/RegionallyFamous/swansong-core";
const storyForgeRepoUrl = "https://github.com/RegionallyFamous/swansong-story-forge";
const homebrewReposUrl =
  "https://github.com/orgs/RegionallyFamous/repositories?q=topic%3Ahomebrew";

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="header-logo" href="#top" aria-label="Yokoi home">
          <img src="/art/yokoi-logo.png" alt="Yokoi" />
        </a>
        <span className="header-tagline">Tools for a strange little handheld</span>
        <nav aria-label="Main navigation">
          <a href="#projects">Projects</a>
          <a href={homebrewReposUrl} target="_blank" rel="noreferrer">
            Homebrew <span aria-hidden="true">↗</span>
          </a>
          <a href="#about">About</a>
          <a href={githubOrgUrl} target="_blank" rel="noreferrer">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <div className="ticker" aria-hidden="true">
        <div>
          <span>BUILD STRANGE THINGS</span>
          <b>✦</b>
          <span>KEEP THE FILES OPEN</span>
          <b>●</b>
          <span>PLAY SIDEWAYS</span>
          <b>✦</b>
          <span>BUILD STRANGE THINGS</span>
          <b>●</b>
          <span>KEEP THE FILES OPEN</span>
        </div>
      </div>

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow">
            <span>WORKSHOP FILE</span>
            <strong>001</strong>
          </div>
          <h1>
            WonderSwan deserves more <em>weird little projects.</em>
          </h1>
          <p>
            Yokoi is a workshop for players, builders, and tinkerers—home to
            openFPGA work, odd hardware, printable objects, and useful downloads.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#projects">
              Browse the projects <span aria-hidden="true">↓</span>
            </a>
            <a className="button button-ghost" href="#about">
              What is Yokoi?
            </a>
          </div>
          <div className="hero-fineprint">
            <span>OPEN FILES</span>
            <span>NO ROMS</span>
            <span>MADE WITH CARE</span>
          </div>
        </div>

        <figure className="hero-art">
          <div className="art-orbit art-orbit-one" aria-hidden="true" />
          <div className="art-orbit art-orbit-two" aria-hidden="true" />
          <img
            src="/art/yokoi-workbench-hero-v2.png"
            alt="A surreal translucent WonderSwan on an indigo electronics workbench, surrounded by ribbon cables, cartridges, and a floating paper swan"
          />
          <span className="sticker sticker-top">ODD HARDWARE INSIDE</span>
          <span className="sticker sticker-bottom">Y / SWAN LAB</span>
          <figcaption>
            <span>FIG. 001</span>
            <span>FICTIONAL WORKBENCH STUDY</span>
          </figcaption>
        </figure>
      </section>

      <section className="project-section" id="projects">
        <div className="section-heading">
          <div>
            <span className="section-kicker">THE USEFUL PILE</span>
            <h2>Projects</h2>
          </div>
          <p>
            Three open workbenches for playing, building, and making strange
            new things for WonderSwan.
          </p>
        </div>

        <div className="project-grid">
          <article className="project-card project-desktop">
            <div className="card-topline">
              <span>01 / NATIVE PLAYER</span>
              <span className="status status-desktop">MACOS</span>
            </div>
            <a
              className="card-visual project-art"
              href={desktopRepoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the SwanSong Desktop repository"
            >
              <img
                src="/art/swansong-desktop.webp"
                alt="A translucent vertical handheld floating above a compact silver desktop computer in a surreal indigo game laboratory"
              />
            </a>
            <div className="card-copy">
              <h3>SwanSong Desktop</h3>
              <p>
                A private, native WonderSwan player and translation workbench
                designed for the Mac.
              </p>
              <ul className="chip-list" aria-label="SwanSong Desktop features">
                <li>NATIVE MACOS</li>
                <li>ARES ENGINE</li>
                <li>TRANSLATION LAB</li>
              </ul>
            </div>
            <div className="card-actions">
              <span>PUBLIC REPOSITORY</span>
              <a href={desktopRepoUrl} target="_blank" rel="noreferrer">
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <article className="project-card project-core">
            <div className="card-topline">
              <span>02 / OPENFPGA</span>
              <span className="status status-core">ANALOGUE POCKET</span>
            </div>
            <a
              className="card-visual project-art"
              href={coreRepoUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open the SwanSong Core repository"
            >
              <img
                src="/art/swansong-core.webp"
                alt="A translucent horizontal WonderSwan opened like a scientific specimen to reveal a glowing FPGA and circuit board"
              />
            </a>
            <div className="card-copy">
              <h3>SwanSong Core</h3>
              <p>
                WonderSwan and WonderSwan Color rebuilt for Analogue Pocket,
                with open source, documentation, and reproducible builds.
              </p>
              <ul className="chip-list" aria-label="SwanSong Core features">
                <li>OPENFPGA</li>
                <li>VERTICAL PLAY</li>
                <li>WS + WSC</li>
              </ul>
            </div>
            <div className="card-actions">
              <span>PUBLIC REPOSITORY</span>
              <a href={coreRepoUrl} target="_blank" rel="noreferrer">
                View on GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>

          <article className="project-card project-homebrew">
            <div className="card-topline">
              <span>03 / MAKE GAMES</span>
              <span className="status">HOMEBREW</span>
            </div>
            <a
              className="card-visual project-art"
              href={homebrewReposUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Browse the Regionally Famous WonderSwan homebrew repositories"
            >
              <img
                src="/art/wonderswan-homebrew.webp"
                alt="Translucent cartridges connected to miniature original pixel-art worlds on an indigo homebrew workbench"
              />
            </a>
            <div className="card-copy">
              <h3>Homebrew Workshop</h3>
              <p>
                Tools, example games, and graphics-first workflows for building
                original WonderSwan Color projects.
              </p>
              <ul className="chip-list" aria-label="Homebrew workshop features">
                <li>STORY FORGE</li>
                <li>EXAMPLE GAMES</li>
                <li>WSC TOOLS</li>
              </ul>
            </div>
            <div className="card-actions card-actions-split">
              <a href={storyForgeRepoUrl} target="_blank" rel="noreferrer">
                Story Forge <span aria-hidden="true">↗</span>
              </a>
              <a href={homebrewReposUrl} target="_blank" rel="noreferrer">
                All homebrew <span aria-hidden="true">↗</span>
              </a>
            </div>
          </article>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about-index" aria-hidden="true">
          <span>Y</span>
          <span>05</span>
        </div>
        <div className="about-copy">
          <span className="section-kicker">WHY YOKOI?</span>
          <h2>A workshop, not a storefront.</h2>
          <p>
            Yokoi is where WonderSwan side projects become usable things: tested
            files, readable notes, reproducible builds, and downloads that say
            exactly what they contain.
          </p>
        </div>
        <ol className="manifesto">
          <li>
            <span>01</span>
            <strong>Make the oddness useful.</strong>
          </li>
          <li>
            <span>02</span>
            <strong>Document the sharp edges.</strong>
          </li>
          <li>
            <span>03</span>
            <strong>Share files, not mysteries.</strong>
          </li>
        </ol>
      </section>

      <aside className="legal-note">
        <span className="legal-symbol" aria-hidden="true">!</span>
        <p>
          <strong>No ROMs. No BIOS files.</strong> Yokoi publishes original tools,
          hardware work, documentation, and patching software. Bring only game
          files and firmware you are legally entitled to use.
        </p>
      </aside>

      <footer>
        <div>
          <span className="footer-brand">YOKOI</span>
          <span>TOOLS FOR A STRANGE LITTLE HANDHELD</span>
        </div>
        <div className="footer-links">
          <a href="#top">Back to top ↑</a>
          <a href={githubOrgUrl} target="_blank" rel="noreferrer">GitHub ↗</a>
        </div>
      </footer>
    </main>
  );
}
