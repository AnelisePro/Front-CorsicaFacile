import React from 'react'
import clsx from 'clsx'
import styles from './ProgressStepper.module.scss'

interface ProgressStepperProps {
  currentStep: number
}

const steps = ['Acceptée', 'En cours', 'Terminée']

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  return (
    <div className={styles.progressStepper}>
      {steps.map((step, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber <= currentStep

        return (
          <div key={step} className={styles.step}>
            <div className={clsx(styles.circle, isActive ? styles.active : styles.inactive)}>
              {stepNumber}
            </div>
            <div className={styles.label}>{step}</div>
            {index < steps.length - 1 && (
              <div className={clsx(styles.connector, isActive ? styles.active : '')}></div>
            )}
          </div>
        )
      })}
    </div>
  )
}


