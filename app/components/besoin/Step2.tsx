'use client'

import React from 'react'
import styles from'./Step2.module.scss'
import { BesoinFormData } from './BesoinFormData'

interface Step2Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const Step2 = ({ data, setData }: Step2Props) => (
  <div className={styles.container}>
    <h2 className={styles.title}>Décrivez votre besoin</h2>
    <p>N'hésitez pas à donner le plus de détails possibles (mesures, matériaux, contraintes particulières, etc.) afin que l'artisan puisse bien comprendre votre demande. </p>
    <textarea
      className={styles.textarea}
      rows={6}
      value={data.description}
      onChange={(e) => setData({ ...data, description: e.target.value })}
      minLength={30}
      required
      placeholder="Expliquez clairement ce que vous attendez du prestataire..."
    />
    {data.description.length < 30 && (
      <p className={styles.errorMessage}>Minimum 30 caractères</p>
    )}
  </div>
)

export default Step2


