import React from "react";

/**
 * AboutUs component for Vocatio
 * Team-focused About page with photos of Mihir and Augustin.
 */

export default function AboutUs() {
  return (
    <main className="w-full">
      {/* Hero */}
      <section className="px-6 sm:px-8 lg:px-12 py-16 sm:py-20 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
            Meet the <span className="text-emerald-600 dark:text-emerald-400">Vocatio</span> Team
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300">
            We’re two founders passionate about connecting people to purpose.
            Together, we’re building Vocatio as the go-to hub for volunteering.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-6 sm:px-8 lg:px-12 py-12 sm:py-16 bg-slate-50 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 text-center">
            Our Founders
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
            {/* Mihir */}
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <img
                src="/team/mihirimage.jpg"  // updated image path
                alt="Mihir Ganesan"
                className="h-32 w-32 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Mihir Ganesan
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Co-Founder</p>
              <p className="mt-3 text-center text-slate-600 dark:text-slate-300 max-w-sm">
                Born in Silicon Valley with a passion for technology, Mihir thought of this idea as a means to satisfy high-school mandated volunteering hours.
                Tired of mundane volunteering opportunities, and the difficulty with finding them, he takes his experience in business and computer science to
                make volunteering fun and accessible. 
                <br />
                <strong>Contact Information:</strong> <br />
                408-859-0615 <br />
                <a
                  href="https://www.linkedin.com/in/mihir-ganesan/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline"
                >
                  LinkedIn
                </a>
              </p>
            </div>

            {/* Augustin */}
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">
              <img
                src="/team/augustin.jpg"
                alt="Augustin"
                className="h-32 w-32 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
              <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Augustin
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">Co-Founder</p>
              <p className="mt-3 text-center text-slate-600 dark:text-slate-300 max-w-sm">
                Augustin is focused on design and user experience, ensuring Vocatio is
                simple, intuitive, and delightful for both volunteers and organizations.
                He has taken his experience in computer science to completely handle the technical front at Vocatio.
                <br />
                <strong>Contact Information:</strong> <br />
                786-616-2355 <br />
                <a
                  href="https://www.linkedin.com/in/augustinmuyl/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline"
                >
                  LinkedIn
                </a>{" "}
                |{" "}
                <a
                  href="https://www.augustinmuyl.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 underline"
                >
                  Portfolio
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
