import '@/app/ui/global.css';
import {inter} from "@/app/ui/fonts";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        {/* antialiased 类使得字体更加平整*/}
        <body className={`${inter.className} antialiased`}>{children}</body>
        </html>
    );
}
