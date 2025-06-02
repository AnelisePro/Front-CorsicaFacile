import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import styles from './AvailabilitySlots.module.scss'

export interface AvailabilitySlot {
  id: number
  start_time: string
  end_time: string
}

const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

const dayToIndex: Record<string, number> = {
  Dimanche: 0,
  Lundi: 1,
  Mardi: 2,
  Mercredi: 3,
  Jeudi: 4,
  Vendredi: 5,
  Samedi: 6,
}

type Props = {
  isEditing: boolean
}

export default function AvailabilitySlots({ isEditing }: Props) {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [newSlot, setNewSlot] = useState<{ day: string; start_time: string; end_time: string }>({
    day: 'Lundi',
    start_time: '',
    end_time: '',
  })
  const [isFullDayUnavailable, setIsFullDayUnavailable] = useState(false)
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null)

  useEffect(() => {
    fetchSlots()
  }, [])

  // Ici formatSlot renvoie JSX avec <strong> autour du jour et ":" fixe après le jour
  const formatSlot = (startISO: string, endISO: string) => {
    const start = new Date(startISO)
    const end = new Date(endISO)
    const dayName = days[start.getDay()]

    const formatHour = (date: Date) => `${date.getHours()}h${date.getMinutes().toString().padStart(2, '0')}`

    // Si créneau couvre toute la journée (00:00 à 00:00 du lendemain)
    const isFullDay =
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      end.getHours() === 0 &&
      end.getMinutes() === 0 &&
      (end.getTime() - start.getTime() === 24 * 60 * 60 * 1000)

    if (isFullDay)
      return (
        <span>
          <strong>{dayName} :</strong> Indisponible
        </span>
      )

    return (
      <span>
        <strong>{dayName} :</strong> {formatHour(start)} - {formatHour(end)}
      </span>
    )
  }

  const fetchSlots = async () => {
    const token = localStorage.getItem('artisanToken')
    if (!token) return
    try {
      const res = await axios.get('http://localhost:3001/artisans/availability_slots', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSlots(res.data)
    } catch {
      toast.error("Erreur lors du chargement des créneaux.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSlot.day) {
      toast.error("Veuillez renseigner le jour.")
      return
    }

    const now = new Date()
    const dayIndex = dayToIndex[newSlot.day]
    if (dayIndex === undefined) {
      toast.error("Jour invalide")
      return
    }

    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // base lundi

    const slotDate = new Date(monday)
    slotDate.setDate(monday.getDate() + (dayIndex - 1))
    slotDate.setHours(0, 0, 0, 0)

    let startDate, endDate

    if (isFullDayUnavailable) {
      // Indisponible toute la journée: de 00:00 à minuit du jour suivant
      startDate = slotDate
      endDate = new Date(slotDate)
      endDate.setDate(endDate.getDate() + 1)
    } else {
      if (!newSlot.start_time || !newSlot.end_time) {
        toast.error("Veuillez renseigner les horaires.")
        return
      }

      const [startHour, startMinute] = newSlot.start_time.split(':').map(Number)
      const [endHour, endMinute] = newSlot.end_time.split(':').map(Number)

      startDate = new Date(slotDate)
      startDate.setHours(startHour, startMinute, 0, 0)

      endDate = new Date(slotDate)
      endDate.setHours(endHour, endMinute, 0, 0)

      if (startDate >= endDate) {
        toast.error("L'heure de début doit être avant l'heure de fin.")
        return
      }
    }

    const token = localStorage.getItem('artisanToken')
    if (!token) {
      toast.error("Utilisateur non authentifié.")
      return
    }

    try {
      const slotToSend = {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      }

      if (editingSlotId) {
        await axios.put(`http://localhost:3001/artisans/availability_slots/${editingSlotId}`, slotToSend, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Créneau modifié !")
        setEditingSlotId(null)
      } else {
        const res = await axios.post('http://localhost:3001/artisans/availability_slots', slotToSend, {
          headers: { Authorization: `Bearer ${token}` },
        })
        toast.success("Créneau ajouté !")
        setSlots(prev => [...prev, res.data])
      }
      setNewSlot({ day: 'Lundi', start_time: '', end_time: '' })
      setIsFullDayUnavailable(false)
      fetchSlots()
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.join(", ") || "Erreur inconnue"
      toast.error(msg)
    }
  }

  const handleEditSlot = (slot: AvailabilitySlot) => {
    const startDate = new Date(slot.start_time)
    const dayName = days[startDate.getDay()]

    // Vérifier si le créneau est une indisponibilité journée entière
    const isFullDay =
      startDate.getHours() === 0 &&
      startDate.getMinutes() === 0 &&
      new Date(slot.end_time).getHours() === 0 &&
      new Date(slot.end_time).getMinutes() === 0 &&
      (new Date(slot.end_time).getTime() - startDate.getTime() === 24 * 60 * 60 * 1000)

    setNewSlot({
      day: dayName,
      start_time: isFullDay ? '' : slot.start_time.slice(11, 16),
      end_time: isFullDay ? '' : slot.end_time.slice(11, 16),
    })
    setIsFullDayUnavailable(isFullDay)
    setEditingSlotId(slot.id)
  }

  const deleteSlot = async (id: number) => {
    const token = localStorage.getItem('artisanToken')
    if (!token) return
    try {
      await axios.delete(`http://localhost:3001/artisans/availability_slots/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setSlots(prev => prev.filter(slot => slot.id !== id))
      setEditingSlotId(null)
      toast.success('Créneau supprimé.')
    } catch {
      toast.error("Erreur lors de la suppression du créneau.")
    }
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Liste des créneaux</h2>
      <div className={styles.cardsContainer}>
        {slots.map(slot => (
          <div key={slot.id} className={styles.card}>
            <p className={styles.slotText}>{formatSlot(slot.start_time, slot.end_time)}</p>
            {isEditing && (
              <div className={styles.actions}>
                <button
                  onClick={() => handleEditSlot(slot)}
                  className={styles.btnEdit}
                  aria-label={`Modifier créneau ${slot.id}`}
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteSlot(slot.id)}
                  className={styles.btnDelete}
                  aria-label={`Supprimer créneau ${slot.id}`}
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className={styles.formGroupCard}>
          <h3>{editingSlotId ? 'Modifier un créneau' : 'Ajouter un créneau'}</h3>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <label className={styles.label}>
                Jour
                <select
                  value={newSlot.day}
                  onChange={e => setNewSlot({ ...newSlot, day: e.target.value })}
                  required
                  className={styles.select}
                >
                  {days.slice(1).concat(days[0]).map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isFullDayUnavailable}
                  onChange={e => setIsFullDayUnavailable(e.target.checked)}
                  className={styles.checkbox}
                />
                Indisponible
              </label>
            </div>

            {!isFullDayUnavailable && (
              <div className={styles.row}>
                <label className={styles.label}>
                  Début
                  <input
                    type="time"
                    value={newSlot.start_time}
                    onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    required={!isFullDayUnavailable}
                    className={styles.input}
                  />
                </label>

                <label className={styles.label}>
                  Fin
                  <input
                    type="time"
                    value={newSlot.end_time}
                    onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    required={!isFullDayUnavailable}
                    className={styles.input}
                  />
                </label>
              </div>
            )}

            <button type="submit" className={styles.submitBtn}>
              {editingSlotId ? 'Modifier' : 'Ajouter'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}


