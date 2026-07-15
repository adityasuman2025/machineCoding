export type SelectedSeatType = {
    groupId: string;
    rowId: string;
    seatId: number;
};

const listeners = new Set<() => void>();
let selectedSeat: SelectedSeatType | null = null;

export const seatStore = {
    getSeat() {
        return selectedSeat;
    },
    selectSeat(seat: SelectedSeatType) {
        selectedSeat = seat;
        listeners.forEach(listener => listener());
    },
    subscribe(listener: () => void) {
        listeners.add(listener);

        return () => listeners.delete(listener)
    }
};
