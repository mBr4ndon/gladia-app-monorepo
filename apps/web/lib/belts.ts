export const BJJ_BELTS = [
    { value: "white", label: "White", color: "hsl(0, 0%, 100%)", textColor: "hsl(0, 0%, 0%)" },
    { value: "grey-white", label: "Grey/White", color: "linear-gradient(90deg, hsl(0, 0%, 50%) 50%, hsl(0, 0%, 100%) 50%)", textColor: "hsl(0, 0%, 0%)" },
    { value: "grey", label: "Grey", color: "hsl(0, 0%, 50%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "grey-black", label: "Grey/Black", color: "linear-gradient(90deg, hsl(0, 0%, 50%) 50%, hsl(0, 0%, 0%) 50%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "yellow-white", label: "Yellow/White", color: "linear-gradient(90deg, hsl(45, 100%, 50%) 50%, hsl(0, 0%, 100%) 50%)", textColor: "hsl(0, 0%, 0%)" },
    { value: "yellow", label: "Yellow", color: "hsl(45, 100%, 50%)", textColor: "hsl(0, 0%, 0%)" },
    { value: "yellow-black", label: "Yellow/Black", color: "linear-gradient(90deg, hsl(45, 100%, 50%) 50%, hsl(0, 0%, 0%) 50%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "orange-white", label: "Orange/White", color: "linear-gradient(90deg, hsl(25, 100%, 50%) 50%, hsl(0, 0%, 100%) 50%)", textColor: "hsl(0, 0%, 0%)" },
    { value: "orange", label: "Orange", color: "hsl(25, 100%, 50%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "orange-black", label: "Orange/Black", color: "linear-gradient(90deg, hsl(25, 100%, 50%) 50%, hsl(0, 0%, 0%) 50%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "green-white", label: "Green/White", color: "linear-gradient(90deg, hsl(120, 100%, 35%) 50%, hsl(0, 0%, 100%) 50%)", textColor: "hsl(0, 0%, 0%)" },
    { value: "green", label: "Green", color: "hsl(120, 100%, 35%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "green-black", label: "Green/Black", color: "linear-gradient(90deg, hsl(120, 100%, 35%) 50%, hsl(0, 0%, 0%) 50%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "blue", label: "Blue", color: "hsl(220, 100%, 40%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "purple", label: "Purple", color: "hsl(280, 100%, 40%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "brown", label: "Brown", color: "hsl(30, 50%, 30%)", textColor: "hsl(0, 0%, 100%)" },
    { value: "black", label: "Black", color: "hsl(0, 0%, 0%)", textColor: "hsl(0, 0%, 100%)" },
] as const;

export const getBeltInfo = (beltValue: string) => {
    return BJJ_BELTS.find((belt) => belt.value === beltValue) || BJJ_BELTS[0];
};
