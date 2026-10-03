export type OnInspectionState = {
  playing: boolean;
  hovered: boolean;
  keyboardFocused: boolean;
  expanded: boolean;
};

export const initialOnInspection: OnInspectionState = {
  playing: false, hovered: false, keyboardFocused: false, expanded: false,
};

export type OnInspectionAction =
  | { type: "play"; value: boolean }
  | { type: "hover"; value: boolean }
  | { type: "focus"; value: boolean }
  | { type: "open" | "close" | "manual" };

// 自动播放意图与暂时细看分开；关闭细看不能撤销用户的手动暂停。
export function onInspectionReducer(state: OnInspectionState, action: OnInspectionAction): OnInspectionState {
  switch (action.type) {
    case "play": return { ...state, playing: action.value };
    case "hover": return { ...state, hovered: action.value };
    case "focus": return { ...state, keyboardFocused: action.value };
    case "open": return { ...state, expanded: true, hovered: false };
    case "close": return { ...state, expanded: false };
    case "manual": return { ...state, playing: false };
  }
}

export function isOnInspecting(state: OnInspectionState) {
  return state.expanded || state.hovered || state.keyboardFocused;
}

export function shouldRotateOnInspection(state: OnInspectionState) {
  return state.playing && !isOnInspecting(state);
}
