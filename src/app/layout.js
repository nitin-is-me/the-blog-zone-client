import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css"
export const metadata = {
  title: {
    default: "The Blog Zone – Open Source Blogging Platform",
    template: "%s | The Blog Zone",
  },
  description: "The Blog Zone is an open-source, secure blogging platform for writing and public or private blogs with full control.",
  verification:{
    google: "OcTLnRMAPQBsCsFlZjz9CV2WL1SNSbk-5aoeqT8uEDs"
  },
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
