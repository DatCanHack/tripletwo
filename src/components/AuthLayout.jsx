import { Link } from "react-router-dom";

export default function AuthLayout({ title, subtitle, children, altLink }) {
  return (
    <section className="min-h-[calc(100dvh-64px)] flex items-center bg-[#0f1214]">
      <div className="container">
        <div className="mx-auto max-w-md">
          <div className="rounded-3xl border border-[#1c2227] bg-[#12171b] p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
              )}
            </div>
            {children}
            {altLink && (
              <p className="mt-6 text-sm text-gray-400">
                {altLink.text}{" "}
                <Link
                  to={altLink.to}
                  className="text-[#00B3A4] hover:underline"
                >
                  {altLink.cta}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
