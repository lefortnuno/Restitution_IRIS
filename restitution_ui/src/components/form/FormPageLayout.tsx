import Asides from "@/layout/asides/Asides";
import Header from "@/layout/headers/Header";
import { UrlAjout } from "@/layout/content/url";

interface FormPageLayoutProps {
  titre: string;
  children: React.ReactNode;
}

export default function FormPageLayout({ titre, children }: FormPageLayoutProps) {
  return (
    <>
      <Asides />

      <div className="md:pl-64 flex flex-col flex-1">
        <Header />

        <main className="flex-1">
          <UrlAjout />

          <div className="py-2">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 md:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 my-3">
                {titre}
              </h1>
            </div>

            <div className="p-4 px-4 sm:px-6 md:px-8">{children}</div>
          </div>
        </main>
      </div>
    </>
  );
}
