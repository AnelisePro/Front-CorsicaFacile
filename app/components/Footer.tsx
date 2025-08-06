import styles from './Footer.module.scss'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        <div>
          <Image
            src="/images/logoFooter.svg"
            alt="Logo CorsicaFacile"
            width={160}
            height={160}
            className={styles.logo}
           />
        </div>
        <div>
          <h3>À propos</h3>
          <ul>
            <li><Link href="/qui-sommes-nous">Qui sommes-nous ?</Link></li>
          </ul>
        </div>
        <div>
          <h3>Ressources clients</h3>
          <ul>
          <li><Link href="/comment-ca-marche/clients">Comment ça marche ?</Link></li>
            <li><Link href="/besoin">Déclarer un besoin</Link></li>
            <li><Link href="/mon-espace">Accéder à mon espace</Link></li>
          </ul>
        </div>
        <div>
          <h3>Ressources artisans</h3>
          <ul>
            <li><Link href="/comment-ca-marche/artisans">Comment ça marche ?</Link></li>
            <li><Link href="/annonces">Voir les annonces</Link></li>
            <li><Link href="/formules">Nos formules</Link></li>
            <li><Link href="/mon-espace">Accéder à mon espace</Link></li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomLine}>
        <p>© CorsicaFacile {currentYear}</p>
        <ul>
          <li><Link href="/mentions-legales">Mentions légales</Link></li>
          <li><Link href="/cgu">CGU</Link></li>
          <li><Link href="/confidentialite">Politique de confidentialité</Link></li>
          <li><Link href="/contact">Nous contacter</Link></li>
        </ul>
      </div>
    </footer>
  )
}