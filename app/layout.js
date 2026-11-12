import "./globals.css";
import { SiteHeader, SiteFooter } from "../components/SiteShell";
import Assistant from "../components/Assistant";

export const metadata = {
  title: "THE TURF | Dibrugarh's place to play",
  description: "A new home for the game in Dibrugarh. Explore the turf and try the booking experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Assistant />
      </body>
    </html>
  );
}
