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
  const timeSlots = generateTimeSlots(8, 20, 30)
  const today = new Date().toISOString().slice(0, 10)
  
  // États locaux
  const [scheduleType, setScheduleType] = useState<'single_day' | 'date_range'>(
    data.schedule.type || 'single_day'
  )
  const [singleDate, setSingleDate] = useState(data.schedule.date || '')
  const [startDate, setStartDate] = useState(data.schedule.start_date || '')
  const [endDate, setEndDate] = useState(data.schedule.end_date || '')
  const [startTime, setStartTime] = useState(data.schedule.start_time || '')
  const [endTime, setEndTime] = useState(data.schedule.end_time || '')

  // Fonction pour valider le planning complet
  const isValidSchedule = () => {
    if (!startTime || !endTime || startTime >= endTime) return false
    
    if (scheduleType === 'single_day') {
      return !!singleDate
    } else {
      return !!startDate && !!endDate && startDate <= endDate
    }
  }

  // Mise à jour des données quand les états changent
  useEffect(() => {
    if (isValidSchedule()) {
      setData((prev: BesoinFormData) => ({
        ...prev,
        schedule: {
          type: scheduleType,
          start_time: startTime,
          end_time: endTime,
          ...(scheduleType === 'single_day' 
            ? { 
                date: singleDate,
                start_date: undefined,
                end_date: undefined 
              }
            : { 
                start_date: startDate,
                end_date: endDate,
                date: undefined 
              }
          )
        }
      }))
    }
  }, [scheduleType, singleDate, startDate, endDate, startTime, endTime, setData])

  // Gestionnaire de changement de type
  const handleTypeChange = (type: 'single_day' | 'date_range') => {
    setScheduleType(type)
    // Reset des dates quand on change de type
    if (type === 'single_day') {
      setStartDate('')
      setEndDate('')
    } else {
      setSingleDate('')
    }
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Quand souhaitez-vous la prestation ?</h2>

      {/* Sélecteur de type de planning */}
      <div className={styles.scheduleTypeSelector}>
        <h3 className={styles.subtitle}>Type de planning</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              value="single_day"
              checked={scheduleType === 'single_day'}
              onChange={() => handleTypeChange('single_day')}
            />
            <span className={styles.radioLabel}>Un jour spécifique</span>
          </label>
          
          <label className={styles.radioOption}>
            <input
              type="radio"
              value="date_range"
              checked={scheduleType === 'date_range'}
              onChange={() => handleTypeChange('date_range')}
            />
            <span className={styles.radioLabel}>Plusieurs jours (période)</span>
          </label>
        </div>
      </div>

      {/* Sélection des dates */}
      <div className={styles.dateSection}>
        <h4 className={styles.sectionTitle}>
          {scheduleType === 'single_day' ? 'Date souhaitée' : 'Période souhaitée'}
        </h4>
        
        {scheduleType === 'single_day' ? (
          <div className={styles.singleDateInput}>
            <label className={styles.dateLabel}>
              Le{' '}
              <input
                type="date"
                className={styles.dateInput}
                value={singleDate}
                min={today}
                onChange={(e) => setSingleDate(e.target.value)}
                required
              />
            </label>
          </div>
        ) : (
          <div className={styles.dateRangeInputs}>
            <label className={styles.dateLabel}>
              Du{' '}
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                min={today}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </label>
            
            <label className={styles.dateLabel}>
              au{' '}
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                required
                disabled={!startDate}
              />
            </label>
          </div>
        )}

        {scheduleType === 'date_range' && startDate && endDate && startDate > endDate && (
          <p className={styles.error}>
            La date de fin doit être après la date de début.
          </p>
        )}
      </div>

      {/* Sélection des horaires */}
      <div className={styles.timeSection}>
        <h4 className={styles.sectionTitle}>
          Horaires {scheduleType === 'date_range' ? '(quotidiens)' : ''}
        </h4>
        
        <div className={styles.timeInputs}>
          <label className={styles.timeLabel}>
            De{' '}
            <select
              className={styles.timeSelect}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
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

          <label className={styles.timeLabel}>
            à{' '}
            <select
              className={styles.timeSelect}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              disabled={!startTime}
            >
              <option value="">Heure de fin</option>
              {timeSlots
                .filter((slot) => slot > startTime)
                .map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
            </select>
          </label>
        </div>

        {startTime && endTime && startTime >= endTime && (
          <p className={styles.error}>
            L'heure de fin doit être après l'heure de début.
          </p>
        )}
      </div>

      {/* Résumé du planning */}
      {isValidSchedule() && (
        <div className={styles.schedulePreview}>
          <h4 className={styles.previewTitle}>Résumé de votre planning</h4>
          <div className={styles.previewContent}>
            {scheduleType === 'single_day' ? (
              <p>
                <strong>Le {new Date(singleDate).toLocaleDateString('fr-FR')}</strong><br />
                de <strong>{startTime}</strong> à <strong>{endTime}</strong>
              </p>
            ) : (
              <p>
                <strong>Du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}</strong><br />
                chaque jour de <strong>{startTime}</strong> à <strong>{endTime}</strong>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Step4







