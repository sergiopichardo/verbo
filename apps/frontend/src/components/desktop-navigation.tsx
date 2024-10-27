import Link from "next/link";

export function DesktopNavigation() {
    return (
        <div className="flex flex-row gap-4 px-2 py-2 bg-blue-500 text-white">
            <Link href="/">Home</Link>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
        </div>
    );
}