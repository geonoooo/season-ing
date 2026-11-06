import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type TransitionEvent,
} from "react";

const SHEET_SNAPS = ["collapsed", "half", "full"] as const;
type SheetSnap = (typeof SHEET_SNAPS)[number];
type SnapHeights = Record<SheetSnap, number>;

const HALF_RATIO = 0.4;
const TOP_GAP = 8;
const DRAG_THRESHOLD = 6;
const FLICK_PROJECTION_MS = 150;
const FLICK_IDLE_MS = 100;

const SNAP_MAX_HEIGHT: Record<SheetSnap, string | undefined> = {
  collapsed: undefined,
  half: `${HALF_RATIO * 100}%`,
  full: `calc(100% - ${TOP_GAP}px)`,
};

interface SheetGesture {
  startY: number;
  startHeight: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  snapHeights: SnapHeights | null;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const nearestSnap =(snapHeights: SnapHeights, height: number): SheetSnap =>
  SHEET_SNAPS.reduce((nearest, snap) =>
    Math.abs(snapHeights[snap] - height) < Math.abs(snapHeights[nearest] - height) ? snap : nearest,
  );

// 시트 위 형제(버튼 줄 등)가 차지한 높이를 빼야 CSS의 max-height·flex-shrink 결과와 같아진다
const measureSnapHeights = (sheet: HTMLElement, header: HTMLElement, body: HTMLElement): SnapHeights => {
  const column = sheet.parentElement ?? sheet;
  const firstChild = column.firstElementChild ?? sheet;
  const freeAbove = firstChild.getBoundingClientRect().top - column.getBoundingClientRect().top;
  const collapsed = header.offsetHeight;
  const natural = collapsed + body.scrollHeight;
  const full = Math.max(
    collapsed,
    Math.min(natural, column.clientHeight - TOP_GAP, sheet.offsetHeight + freeAbove),
  );
  const half = Math.max(collapsed, Math.min(full, column.clientHeight * HALF_RATIO));
  return { collapsed, half, full };
};

export const useSheetDrag = () => {
  const sheetRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [snap, setSnap] = useState<SheetSnap>("half");
  const [height, setHeight] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const sheet = sheetRef.current;
    const header = headerRef.current;
    const body = bodyRef.current;
    if (!event.isPrimary || event.button !== 0 || !sheet || !header || !body) return;

    const { pointerId } = event;
    const gesture: SheetGesture = {
      startY: event.clientY,
      startHeight: sheet.offsetHeight,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      snapHeights: null,
    };

    // 마우스는 포인터가 헤더를 벗어나면 헤더로 이벤트가 오지 않으므로 window에서 받는다
    const moveDrag = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== pointerId) return;
      const lift = gesture.startY - moveEvent.clientY;
      if (!gesture.snapHeights) {
        // 헤더 안 버튼의 탭과 구분하려고 일정 거리를 움직인 뒤에야 드래그로 본다
        if (Math.abs(lift) < DRAG_THRESHOLD) return;
        gesture.snapHeights = measureSnapHeights(sheet, header, body);
        header.setPointerCapture(pointerId);
        setIsDragging(true);
      }

      const elapsed = moveEvent.timeStamp - gesture.lastTime;
      if (elapsed > 0) gesture.velocity = (gesture.lastY - moveEvent.clientY) / elapsed;
      gesture.lastY = moveEvent.clientY;
      gesture.lastTime = moveEvent.timeStamp;
      setHeight(clamp(gesture.startHeight + lift, gesture.snapHeights.collapsed, gesture.snapHeights.full));
    };

    const endDrag = (endEvent: PointerEvent) => {
      if (endEvent.pointerId !== pointerId) return;
      window.removeEventListener("pointermove", moveDrag);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
      if (!gesture.snapHeights) return;

      const { snapHeights } = gesture;
      const releasedHeight = clamp(
        gesture.startHeight + gesture.startY - gesture.lastY,
        snapHeights.collapsed,
        snapHeights.full,
      );
      const velocity = endEvent.timeStamp - gesture.lastTime > FLICK_IDLE_MS ? 0 : gesture.velocity;
      const nextSnap = nearestSnap(snapHeights, releasedHeight + velocity * FLICK_PROJECTION_MS);
      setSnap(nextSnap);
      setIsDragging(false);
      setHeight(snapHeights[nextSnap] === releasedHeight ? null : snapHeights[nextSnap]);
    };

    window.addEventListener("pointermove", moveDrag);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);
  };

  // 손을 뗀 뒤 목표 높이까지는 px로 애니메이션하고, 끝나면 CSS 상한으로 돌려 내용·화면 크기 변화에 맞춘다
  const finishSettling = (event: TransitionEvent<HTMLElement>) => {
    if (event.target === event.currentTarget && event.propertyName === "height") setHeight(null);
  };

  const style: CSSProperties = height === null ? { maxHeight: SNAP_MAX_HEIGHT[snap] } : { height };

  return {
    sheetRef,
    headerRef,
    bodyRef,
    style,
    isDragging,
    isCollapsed: snap === "collapsed" && height === null,
    startDrag,
    finishSettling,
  };
};
