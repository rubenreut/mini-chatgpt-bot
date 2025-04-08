import React from 'react';
import { Conversation } from '../../../shared/types';
import styles from './ConversationList.module.css';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  handleSelect: (id: string) => void;
  handleDelete: (id: string) => void;
}

const ConversationList = ({ 
  conversations, 
  activeId, 
  handleSelect, 
  handleDelete 
}: ConversationListProps): React.ReactNode => {
  if (!conversations || conversations.length === 0) {
    return null;
  }
  
  const handleDeleteClick = (e: React.MouseEvent, id: string): void => {
    e.stopPropagation();
    handleDelete(id);
  };
  
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Saved Conversations</h2>
      <ul className={styles.items}>
        {conversations.map((convo) => {
          // Create item classes conditionally
          const itemClasses = [
            styles.item,
            convo.id === activeId ? styles.active : ''
          ].filter(Boolean).join(' ');

          return (
            <li 
              key={convo.id} 
              className={itemClasses}
            >
              <button 
                className={styles.selectButton} 
                onClick={() => handleSelect(convo.id)}
                aria-current={convo.id === activeId ? 'true' : 'false'}
              >
                <span className={styles.titlePreview}>{convo.title || 'Untitled Conversation'}</span>
                <span className={styles.date}>
                  {convo.lastUpdated ? new Date(convo.lastUpdated).toLocaleDateString() : 'N/A'}
                </span>
              </button>
              <button 
                className={styles.deleteButton} 
                onClick={(e) => handleDeleteClick(e, convo.id)}
                title="Delete conversation"
                aria-label={`Delete conversation: ${convo.title || 'Untitled'}`}
              >
                ×
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(ConversationList);