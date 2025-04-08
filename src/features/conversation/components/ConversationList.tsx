import React from 'react';
import { Conversation } from '../../../shared/types';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ conversations, activeId, onSelect, onDelete }) => {
  if (!conversations || conversations.length === 0) {
    return null;
  }
  
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
              onClick={() => onSelect(convo.id)}
              aria-current={convo.id === activeId ? 'true' : 'false'}
            >
              <span className="conversation-title-preview">{convo.title || 'Untitled Conversation'}</span>
              <span className="conversation-date">
                {convo.lastUpdated ? new Date(convo.lastUpdated).toLocaleDateString() : 'N/A'}
              </span>
            </button>
            <button 
              className="conversation-delete-button" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(convo.id);
              }}
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