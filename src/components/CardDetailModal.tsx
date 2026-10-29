import { useEffect, useState } from "react";
import { findCard } from "../domain/catalog";
import { InteractiveCardViewer } from "./InteractiveCardViewer";
import { recordEncyclopediaVisit } from "../storage/store";
export function CardDetailModal({
  cardId,
  quantity,
  reduced = false,
  onClose,
  collection,
}: {
  cardId: string;
  quantity: number;
  reduced?: boolean;
  onClose: () => void;
  collection?: Record<string, number>;
}) {
  const [activeId, setActiveId] = useState(cardId);
  useEffect(() => setActiveId(cardId), [cardId]);
  useEffect(() => {
    void recordEncyclopediaVisit(activeId).catch(() => {});
  }, [activeId]);
  const card = findCard(activeId);
  if (!card) return null;
  return (
    <InteractiveCardViewer
      key={card.id}
      card={card}
      quantity={
        collection
          ? (collection[card.id] ?? 0)
          : activeId === cardId
            ? quantity
            : undefined
      }
      reduced={reduced}
      onClose={onClose}
      onNavigate={setActiveId}
    />
  );
}
