import styles from './page.module.scss'
import SearchForm from './components/SearchForm'
import Image from 'next/image'

export default function Home() {
  return (
    <div className={styles.page}>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Corsica Facile</h1>
          <p>Le réflexe local, à portée de clic.</p>
          <SearchForm />
        </div>
      </section>

      {/* À propos */}
      <section className={styles.about}>
        <div className={styles.aboutDecorations}>
          <span className={styles.circle}></span>
        </div>
        <h2>Pourquoi nous faire confiance ?</h2>
        <p>
          Nous sommes la première plateforme 100% Corse dédiée à la mise en relation
          entre clients et artisans locaux. Notre mission est de valoriser l’artisanat
          et les savoir-faire corses dans un esprit de confiance et de simplicité.
        </p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <h3>Recherche simple et rapide</h3>
              </div>
              <div className={styles.cardBack}>
                <p>Trouvez l’artisan qu’il vous faut en quelques clics.</p>
              </div>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <h3>Mise en relation directe</h3>
              </div>
              <div className={styles.cardBack}>
                <p>Contactez les artisans sans intermédiaire.</p>
              </div>
            </div>
          </div>

          <div className={styles.featureItem}>
            <div className={styles.cardInner}>
              <div className={styles.cardFront}>
                <h3>100% Corse</h3>
              </div>
              <div className={styles.cardBack}>
                <p>Valoriser le local et les talents insulaires.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA : Déclarer son besoin */}
     <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaLeft}>
            <h2>Comment déclarer votre besoin ?</h2>
            <ol>
              <li>Décrivez précisément votre projet</li>
              <li>Choisissez vos artisans locaux</li>
              <li>Recevez des devis personnalisés</li>
              <li>Contactez directement l'artisan choisi</li>
            </ol>
          </div>
          <div className={styles.ctaRight}>
            <a href="/declarer" className={styles.ctaButton}>Déclarez votre besoin</a>
          </div>
        </div>
      </section>


      {/* Vidéo ou animation */}
      <section className={styles.videoSection}>
        <video 
          controls 
          src="/video/corsica-artisanat.mp4" 
          className={styles.video}
          poster="/images/video-poster.jpg"
        >
          Votre navigateur ne supporte pas la vidéo.
        </video>
      </section>

      {/* CTA : Inscription / Connexion */}
      <section className={styles.ctaSectionInverse}>
        <div className={styles.ctaContent}>
          <div className={styles.ctaRight}>
            <h2>Connectez-vous ou inscrivez-vous pour accédez à votre espace personnel</h2>
            <p>Gérez vos projets. </p>
          </div>
          <div className={styles.ctaLeft}>
            <a href="/inscription" className={styles.ctaButtonOutline}>Inscription / Connexion</a>
          </div>
        </div>
      </section>

      {/* Partenaires */}
      <section className={styles.partners}>
        <h2>Nos partenaires</h2>
        <div className={styles.partnersLogos}>
          {/* exemple logos partenaires */}
          <Image src="/images/partner1.png" alt="Partenaire 1" width={120} height={60} />
          <Image src="/images/partner2.png" alt="Partenaire 2" width={120} height={60} />
          <Image src="/images/partner3.png" alt="Partenaire 3" width={120} height={60} />
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <h2>Restez informé</h2>
        <form>
          <input type="email" placeholder="Votre email" />
          <button type="submit">S'abonner</button>
        </form>
      </section>

    </div>
  )
}

