import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css"
export const metadata = {
  title: "The Blog Zone",
  description: "An open source and secure blogging platform for your public or private blogs",
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
