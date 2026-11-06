import { useState } from "react";

import type { Place, Stall, TagCount } from "@/d_shared/place";

import { saveStallCheck, setLike, setTag } from "../api/place-browse.api";

type ActionStatus = "idle" | "saving" | "failed";

export const usePlaceActions = (refreshSavedPlaces: () => Promise<void>) => {
  const [status, setStatus] = useState<ActionStatus>("idle");

  const run = async (action: () => Promise<void>) => {
    setStatus("saving");
    try {
      await action();
      await refreshSavedPlaces();
      setStatus("idle");
    } catch {
      setStatus("failed");
    }
  };

  return {
    isSaving: status === "saving",
    hasFailed: status === "failed",
    toggleLike: (place: Place) => run(() => setLike(place, !place.isLiked)),
    toggleTag: (place: Place, tag: TagCount) => run(() => setTag(place, tag.label, !tag.isMine)),
    addTag: (place: Place, label: string) => run(() => setTag(place, label, true)),
    checkStall: (stall: Stall, isStillThere: boolean) =>
      run(() => saveStallCheck(stall, isStillThere)),
  };
};

export type PlaceActions = ReturnType<typeof usePlaceActions>;
