'use client'

import { useState, useEffect } from 'react'
import styles from './page.module.scss'
import SearchForm from './components/SearchForm'
import Image from 'next/image'

export default function Home() {
  const [activeTab, setActiveTab] = useState('clients')

  useEffect(() => {
    document.body.classList.add('hero-page')
    document.body.classList.remove('normal-page')
    
    return () => {
      document.body.classList.remove('hero-page')
    }
  }, [])

  return (
    <div className={styles.page}>
      {/* HERO */}
<section className={styles.hero}>
  <Image
    src="/images/Sartene.JPG"
    alt="Paysage de Sartène"
    fill
    style={{ objectFit: 'cover' }}
    priority
  />
  <div className={styles.heroOverlay}></div>
  <div className={styles.heroContent}>
    <h1>Corsica Facile</h1>
    <p>Le réflexe local à portée de clic.</p>
    <SearchForm />
  </div>
</section>

      {/* Section Services */}
      <section className={styles.servicesSection}>
        <div className={styles.servicesContainer}>
          <h2 className={styles.servicesTitle}>Nos Domaines d'Expertise</h2>
          <div className={styles.servicesGrid}>
            
            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>🏗️</div>
                <h3>Gros Œuvre & Structure</h3>
                <p>Construction, démolition, terrassement et charpente</p>
              </div>
              <div className={styles.serviceCount}>+14 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>⚡</div>
                <h3>Installations & Équipements</h3>
                <p>Électricité, plomberie, chauffage et climatisation</p>
              </div>
              <div className={styles.serviceCount}>+12 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>🎨</div>
                <h3>Finitions & Aménagement</h3>
                <p>Peinture, menuiserie, cuisine et revêtements</p>
              </div>
              <div className={styles.serviceCount}>+13 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>🌿</div>
                <h3>Espaces Extérieurs</h3>
                <p>Jardinage, paysagisme, piscines et terrasses</p>
              </div>
              <div className={styles.serviceCount}>+9 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>🛠️</div>
                <h3>Artisanat & Restauration</h3>
                <p>Ferronerie, poterie, restauration et créations</p>
              </div>
              <div className={styles.serviceCount}>+8 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>🔧</div>
                <h3>Services Spécialisés</h3>
                <p>Multi-services, déménagement et maintenance</p>
              </div>
              <div className={styles.serviceCount}>+10 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>📐</div>
                <h3>Études & Conception</h3>
                <p>Ingénierie, dessin, économie et géométrie</p>
              </div>
              <div className={styles.serviceCount}>+6 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>♿</div>
                <h3>Accessibilité & Confort</h3>
                <p>Solutions PMR, mobilité et équipements</p>
              </div>
              <div className={styles.serviceCount}>+6 métiers</div>
            </div>

            <div className={styles.serviceCard}>
              <div className={styles.serviceContent}>
                <div className={styles.serviceIcon}>🛡️</div>
                <h3>Isolation & Protection</h3>
                <p>Étanchéité, isolation et protection bâtiment</p>
              </div>
              <div className={styles.serviceCount}>+6 métiers</div>
            </div>

          </div>
        </div>
      </section>

      {/* À propos */}
      <section className={styles.about}>
        <div className={styles.aboutContainer}>
          <div className={styles.aboutContent}>
            <h2>Pourquoi nous faire confiance ?</h2>
            <p>
              Nous sommes la première plateforme 100% Corse dédiée à la mise en relation
              entre clients et artisans locaux. Notre mission est de valoriser l'artisanat
              et les savoir-faire corses dans un esprit de confiance et de simplicité.
            </p>
          </div>

          <div className={styles.timelineContainer}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>🔍</div>
              <div className={styles.timelineContent}>
                <h3>Simple & Rapide</h3>
                <p>Trouvez l'artisan qu'il vous faut en quelques clics grâce à notre interface intuitive</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>🤝</div>
              <div className={styles.timelineContent}>
                <h3>Contact Direct</h3>
                <p>Échangez directement avec les artisans, sans intermédiaire ni commission cachée</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>🏝️</div>
              <div className={styles.timelineContent}>
                <h3>100% Corse</h3>
                <p>Soutenez l'économie locale et découvrez les talents authentiques de l'île</p>
              </div>
            </div>
            
            <div className={styles.timelineItem}>
              <div className={styles.timelineIcon}>✅</div>
              <div className={styles.timelineContent}>
                <h3>Artisans Vérifiés</h3>
                <p>Tous nos artisans sont vérifiés et sélectionnés pour leur sérieux et qualité</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Lancement */}
        <section className={styles.launch}>
          <div className={styles.launchContainer}>
            <div className={styles.launchContent}>
              {/* ✅ TEXTE À GAUCHE */}
              <div className={styles.launchText}>
                <h2>Rejoignez nous</h2>
                <p>
                  Corsica Facile c'est tout nouveau ! Rejoignez notre communauté grandissante
                  d'artisans et de clients qui font confiance au savoir-faire corse.
                </p>
              </div>
              
              {/* ✅ BOUTONS À DROITE */}
              <div className={styles.launchButtons}>
                <a href="/auth/login_client" className={styles.launchButton}>
                  Je suis un Client
                </a>
                <a href="/auth/login_artisan" className={styles.launchButton}>
                  Je suis un Artisan
                </a>
              </div>
            </div>
          </div>
        </section>

      {/* Section Comment ça marche */}
      <section className={styles.howItWorks}>
        <div className={styles.howItWorksContainer}>
          <h2>Comment ça marche ?</h2>
          <div className={styles.tabButtons}>
            <button 
              className={`${styles.tabButton} ${activeTab === 'clients' ? styles.active : ''}`}
              onClick={() => setActiveTab('clients')}
            >
              Pour les Clients
            </button>
            <button 
              className={`${styles.tabButton} ${activeTab === 'artisans' ? styles.active : ''}`}
              onClick={() => setActiveTab('artisans')}
            >
              Pour les Artisans
            </button>
          </div>

          <div className={styles.stepsContainer}>
            {activeTab === 'clients' ? (
              <div className={styles.stepsGrid}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Décrivez votre projet</h3>
                  <p>Expliquez vos besoins en détail via notre formulaire simple</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>2</div>
                  <h3>Recevez des propositions</h3>
                  <p>Les artisans qualifiés vous contactent rapidement</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>3</div>
                  <h3>Comparez et choisissez</h3>
                  <p>Évaluez les profils et sélectionnez votre artisan</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>4</div>
                  <h3>Réalisez votre projet</h3>
                  <p>Travaillez en direct avec l'artisan choisi</p>
                </div>
              </div>
            ) : (
              <div className={styles.stepsGrid}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>1</div>
                  <h3>Inscrivez-vous</h3>
                  <p>Créez votre profil professionnel en choisissant une de nos formules</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>2</div>
                  <h3>Complétez votre profil</h3>
                  <p>Ajoutez vos photos et informations</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>3</div>
                  <h3>Recevez des demandes</h3>
                  <p>Vous pouvez contacter les clients ou ce sont eux qui vous contactent pour leurs projets</p>
                </div>
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>4</div>
                  <h3>Développez votre activité</h3>
                  <p>Gagnez de nouveaux clients et développez votre réseau</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section Formules */}
      <section className={styles.formulesSection}>
        <div className={styles.formulesContainer}>
          <div className={styles.formulesHeader}>
            <h2 className={styles.formulesTitle}>Nos Formules Artisans</h2>
            <p className={styles.formulesSubtitle}>
              Choisissez la formule qui correspond le mieux à vos besoins.
            </p>
          </div>

          <div className={styles.cards}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Standard</h2>
              <div className={styles.cardContent}>
                <ul className={styles.cardList}>
                  <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
                  <li><span className={styles.bullet}>✔</span> Réponse limitée à 3 annonces par mois</li>
                  <li><span className={styles.bullet}>✔</span> Visibilité de base sur la plateforme</li>
                </ul>
              </div>
              <p className={styles.cardPrice}>29,99 € / mois</p>
            </div>

            <div className={`${styles.card} ${styles.recommended}`}>
              <div className={styles.tag}>Recommandée</div>
              <h2 className={styles.cardTitle}>Pro</h2>
              <div className={styles.cardContent}>
                <ul className={styles.cardList}>
                  <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
                  <li><span className={styles.bullet}>✔</span> Réponse limitée à 6 annonces par mois</li>
                  <li><span className={styles.bullet}>✔</span> Visibilité prioritaire dans les recherches</li>
                  <li><span className={styles.bullet}>✔</span> Statistiques limitées</li>
                </ul>
              </div>
              <p className={styles.cardPrice}>49,99 € / mois</p>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Premium</h2>
              <div className={styles.cardContent}>
                <ul className={styles.cardList}>
                  <li><span className={styles.bullet}>✔</span> Accès aux annonces</li>
                  <li><span className={styles.bullet}>✔</span> Réponse illimitée aux annonces</li>
                  <li><span className={styles.bullet}>✔</span> Mise en avant sur la page d'accueil</li>
                  <li><span className={styles.bullet}>✔</span> Statistiques complètes</li>
                  <li><span className={styles.bullet}>✔</span> Badge Premium sur votre profil</li>
                  <li><span className={styles.bullet}>✔</span> Accompagnement personnalisé</li>
                </ul>
              </div>
              <p className={styles.cardPrice}>69,99 € / mois</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.newsletterContainer}>
          <h2>Restez informé de nos actualités</h2>
          <p>Recevez les dernières nouvelles et soyez parmi les premiers à découvrir nos nouveautés</p>
          <form className={styles.newsletterForm}>
            <input 
              type="email" 
              placeholder="Votre adresse email" 
              className={styles.emailInput}
              required
            />
            <button type="submit" className={styles.submitButton}>
              S'abonner
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}



