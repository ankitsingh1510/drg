import React from 'react';
import VideoInteraction from './VideoInteraction';

export default function InteractionBox({
  mode,
  documentId,
  token,
  onClose,
}: {
  mode: 'video' | 'chat';
  documentId: string;
  token: string;
  onClose?: () => void;
}) {
  if (mode === 'video') {
    return <VideoInteraction documentId={documentId} token={token} onClose={onClose} />;
  }
  return null;
}
