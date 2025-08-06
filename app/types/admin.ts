export interface User {
  id: number;
  type: 'client' | 'artisan';
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  companyName?: string;
  verified?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  banned: boolean;
  lastLogin: string | null;
  activityCount: number;
  phone?: string;
  city?: string;
  address?: string;
  siren?: string;
}

export interface UserDetails extends User {
  besoins?: Array<{
    id: number;
    title: string;
    createdAt: string;
    responsesCount: number;
  }>;
  recentMessages?: Array<{
    id: number;
    content: string;
    createdAt: string;
    conversationId: number;
  }>;
  expertises?: Array<{
    id: number;
    name: string;
  }>;
  activeConversations?: Array<{
    id: number;
    createdAt: string;
    updatedAt: string;
    messagesCount: number;
  }>;
  reviews?: Array<{
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export interface UserTableProps {
  users: User[];
  onUserClick: (user: User) => void;
  onUserAction: (userId: number, userType: 'client' | 'artisan', action: 'ban' | 'unban') => void;
}

export interface UserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onAction: (userId: number, userType: 'client' | 'artisan', action: 'ban' | 'unban') => void;
}
