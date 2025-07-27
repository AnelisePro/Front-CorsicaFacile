'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import ReviewForm from '@/app/components/ReviewForm'

const ReviewPage = () => {
  const params = useParams()
  const notificationId = params.notificationId as string

  return (
    <div>
      <ReviewForm notificationId={notificationId} />
    </div>
  )
}

export default ReviewPage