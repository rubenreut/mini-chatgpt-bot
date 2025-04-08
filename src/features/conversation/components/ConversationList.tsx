import React from 'react';
import { Conversation } from '../../../shared/types';

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
    <div className="conversation-list">
      <h2 className="conversation-list-title">Saved Conversations</h2>
      <ul className="conversation-items">
        {conversations.map((convo) => (
          <li 
            key={convo.id} 
            className={`conversation-item ${convo.id === activeId ? 'active' : ''}`}
          >
            <button 
              className="conversation-select-button" 
              onClick={() => handleSelect(convo.id)}
              aria-current={convo.id === activeId ? 'true' : 'false'}
            >
              <span className="conversation-title-preview">{convo.title || 'Untitled Conversation'}</span>
              <span className="conversation-date">
                {convo.lastUpdated ? new Date(convo.lastUpdated).toLocaleDateString() : 'N/A'}
              </span>
            </button>
            <button 
              className="conversation-delete-button" 
              onClick={(e) => handleDeleteClick(e, convo.id)}
              title="Delete conversation"
              aria-label={`Delete conversation: ${convo.title || 'Untitled'}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(ConversationList);