export enum availability {
    AVAILABLE = "available",
    BOOKED = "booked",
    NOT_ALLOWED = "not_allowed",
    HIDDEN = "hidden",
}

export type SeatType = {
    id: number;
    type: availability;
};

export type SeatRowType = {
    id: string;
    title: string;
    items: SeatType[];
};

export type SeatGroupType = {
    id: string;
    title: string;
    price: number;
    seatRows: SeatRowType[];
};

export const DATA: SeatGroupType[] = [
    {
        id: "Club",
        title: "Club",
        price: 800,
        seatRows: [
            {
                id: "ClubA",
                title: "A",
                items: new Array(10).fill(0).map((_, idx) => ({
                    id: idx + 1,
                    type: idx % 2 === 0 ? availability.AVAILABLE : availability.BOOKED
                }))
            },
            {
                id: "ClubB",
                title: "B",
                items: new Array(10).fill(0).map((_, idx) => ({
                    id: idx + 1,
                    type: idx % 2 === 1 ? availability.AVAILABLE : availability.BOOKED
                }))
            }
        ]
    },
    {
        id: "Executive",
        title: "Executive",
        price: 500,
        seatRows: [
            {
                id: "ExecutiveD",
                title: "D",
                items: new Array(15).fill(0).map((_, idx) => ({
                    id: idx + 1,
                    type: idx % 2 === 0 ? availability.AVAILABLE : availability.NOT_ALLOWED
                }))
            }
        ]
    }
];
