import React from "react";

export default function About() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-br from-primary-foreground to-gray-100 text-gray-800">
      <header className="bg-primary py-8 text-white shadow-lg">
        <div className="container mx-auto flex flex-col items-center gap-2 px-6 text-center">
          <h1 className="text-4xl font-bold">About Our Project</h1>
          <p className="text-lg">
            Empowering communities through collaboration and action.
          </p>
        </div>
      </header>

      <main className="container mx-auto flex flex-grow flex-col gap-12 px-6 py-12">
        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold text-gray-950">
            What We Offer
          </h2>
          <p className="text-lg text-gray-600">
            Our platform provides a space for users to create <b>companies</b>{" "}
            and organize impactful <b>events</b> within those companies. Whether
            it’s a park cleanup, food distribution drive, or community workshop,
            users can get involved through applications or donations when
            applicable.
          </p>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-3xl font-semibold text-gray-950">How It Works</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800">
                1. Create a Company
              </h3>
              <p className="text-gray-600">
                Start by setting up your company profile. A company acts as a
                hub for managing your events and initiatives.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800">
                2. Host Events
              </h3>
              <p className="text-gray-600">
                Organize events that align with your mission. Events can include
                volunteer opportunities, donation campaigns, and more.
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg bg-white p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-800">
                3. Engage with the Community
              </h3>
              <p className="text-gray-600">
                Users can apply to participate or donate to support your events,
                creating a ripple effect of positive impact.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <h2 className="text-gray-950-700 text-3xl font-semibold">
            Why It Matters
          </h2>
          <p className="text-lg text-gray-600">
            Our mission is to bridge the gap between organizations and
            communities, fostering collaboration to address pressing needs. By
            enabling individuals to contribute their time, skills, or resources,
            we help create sustainable change together.
          </p>
          <blockquote className="border-l-4 border-primary bg-primary p-6 italic text-gray-200">
            &quot;Alone we can do so little; together we can do so much.&quot;
            <footer className="mt-2 text-right">– Helen Keller</footer>
          </blockquote>
        </section>
      </main>

      <footer className="pb-6 text-center text-gray-950">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} CityScape. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
