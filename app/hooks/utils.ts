import { useMemo } from "react";

export const useNow = () => {
    const now = useMemo(() => new Date(), []);
    return now;
}