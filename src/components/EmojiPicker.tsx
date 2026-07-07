const EMOJI_GROUPS = [
  { label: 'Energía & Café', emojis: ['⚡', '🥤', '🧃', '🫙', '☕', '🍵', '🧋', '🫖'] },
  { label: 'Alcohol', emojis: ['🍺', '🍻', '🥂', '🍷', '🍸', '🍹', '🥃', '🫗'] },
  { label: 'Comida', emojis: ['🍔', '🍕', '🍟', '🌮', '🍪', '🍩', '🍫', '🧁', '🍰', '🍭', '🍿', '🥐'] },
  { label: 'Otros', emojis: ['🚬', '💊', '🎮', '📱', '💻', '🎯', '🔥', '💀', '😈', '🤑', '👾', '🃏'] },
]

interface Props {
  onSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onSelect, onClose }: Props) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-3 shadow-xl">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-[#555] font-medium uppercase tracking-wider">Elige un emoji</p>
        <button onClick={onClose} className="text-[#444] text-lg leading-none px-1">✕</button>
      </div>
      {EMOJI_GROUPS.map(group => (
        <div key={group.label} className="mb-3">
          <p className="text-[10px] text-[#444] mb-1.5 uppercase tracking-wider">{group.label}</p>
          <div className="flex flex-wrap gap-1">
            {group.emojis.map(e => (
              <button
                key={e}
                onClick={() => { onSelect(e); onClose() }}
                className="w-9 h-9 rounded-xl text-xl flex items-center justify-center hover:bg-[#333] active:bg-[#444] transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
