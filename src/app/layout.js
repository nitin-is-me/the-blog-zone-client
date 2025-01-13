import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css"
export const metadata = {
  title: "The Blog Zone",
  description: "Created by Nitin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
