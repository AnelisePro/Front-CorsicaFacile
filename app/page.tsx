import styles from './page.module.scss'
import SearchForm from './components/SearchForm'

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Bienvenue sur Corsica Facile</h1>
      <p>Le réflexe local, à portée de clic.</p>
      <p>Gagnez du temps, trouvez le bon pro. La 1ère plateforme 100% Corse, 100% facile.</p>

     <SearchForm />
    </div>
  )
}
