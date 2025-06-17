'use client'

import React, { useState, useEffect } from 'react'
import styles from './Step4.module.scss'
import { BesoinFormData } from './BesoinFormData'

interface Step4Props {
  data: BesoinFormData
  setData: React.Dispatch<React.SetStateAction<BesoinFormData>>
}

const generateTimeSlots = (start = 8, end = 20, interval = 30) => {
  const slots = []
  for (let hour = start; hour <= end; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const hh = hour.toString().padStart(2, '0')
      const mm = min.toString().padStart(2, '0')
      slots.push(`${hh}:${mm}`)
    }
  }
  return slots
}

const Step4 = ({ data, setData }: Step4Props) => {
  const initialSchedule = data.schedule

  const [date, setDate] = useState(initialSchedule.date)
  const [start, setStart] = useState(initialSchedule.start)
  const [end, setEnd] = useState(initialSchedule.end)

  const timeSlots = generateTimeSlots(8, 20, 30)

  useEffect(() => {
    if (
      date &&
      start &&
      end &&
      start < end
    ) {
      // Mise à jour uniquement si les valeurs ont changé pour éviter boucle infinie
      if (
        data.schedule.date !== date ||
        data.schedule.start !== start ||
        data.schedule.end !== end
      ) {
        setData({
          ...data,
          schedule: { date, start, end },
        })
      }
    }
  }, [date, start, end, data.schedule, setData])

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Quand souhaitez-vous la prestation ?</h2>

      <div className={styles.inputsRow}>
        <label className={styles.labelDate}>
          Le{' '}
          <input
            type="date"
            className={styles.dateInput}
            value={date}
            min={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Date de la prestation"
            required
          />
        </label>

        <label className={styles.labelTime}>
          entre{' '}
          <select
            className={styles.timeSelect}
            value={start}
            onChange={(e) => setStart(e.target.value)}
            aria-label="Heure de début"
            required
          >
            <option value="">Heure de début</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.labelTime}>
          et{' '}
          <select
            className={styles.timeSelect}
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            aria-label="Heure de fin"
            required
            disabled={!start}
          >
            <option value="">Heure de fin</option>
            {timeSlots
              .filter((slot) => slot > start)
              .map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
          </select>
        </label>
      </div>

      {start && end && start >= end && (
        <p className={styles.error}>L'heure de fin doit être après l'heure de début.</p>
      )}
    </div>
  )
}

export default Step4





