import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'
import styles from './page.module.scss'

export default function ResetPasswordArtisan() {
  return (
    <Suspense fallback={<div className={styles.loading}>Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
