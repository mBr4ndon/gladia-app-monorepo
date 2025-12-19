type Props = Readonly<{
    children: React.ReactNode;
}>;

export default function GymSettingsLayout({ children }: Props) {
    return (
        <div className="container mx-auto space-y-4 sm:space-y-6 py-4 sm:py-6 px-4">
            {children}
        </div>
    );
}
