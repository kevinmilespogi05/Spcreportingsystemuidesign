import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  ClipboardList,
  MapPin,
  MessageCircle,
  ShieldCheck,
  BellRing,
  Phone,
  Mail,
  Users,
  BookOpen,
  Sparkles,
  Clock3,
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ in_progress: 0, resolved: 0 });
  const [isCountsLoading, setIsCountsLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setIsCountsLoading(true);
      try {
        // 🔒 Calls the backend endpoint — no direct DB exposure
        // Returns only aggregated numbers: { total, in_progress, resolved }
        const res = await fetch("/api/complaints/stats");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCounts({
          in_progress: data.in_progress ?? 0,
          resolved: data.resolved ?? 0,
        });
      } catch (error) {
        console.error("Failed to load complaint stats", error);
      } finally {
        setIsCountsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1e3a5f] text-white shadow-sm">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">SP-Complaints</p>
              <h1 className="text-sm font-semibold text-slate-900">Barangay San Pablo Community</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <a href="#benefits" className="text-sm text-slate-600 hover:text-slate-900">Benefits</a>
            <a href="#announcements" className="text-sm text-slate-600 hover:text-slate-900">Updates</a>
            <a href="#support" className="text-sm text-slate-600 hover:text-slate-900">Support</a>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Login</Button>
            <Button size="sm" onClick={() => navigate("/login")}>Get Started</Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[#1e3a5f] to-slate-700 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="text-white">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-200 shadow-sm ring-1 ring-white/10">
                <ShieldCheck className="h-4 w-4" />
                Built for Barangay San Pablo</p>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
                Your Barangay, <span className="text-amber-300">Your Voice</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-200 sm:text-xl">
                Connect residents of San Pablo, report barangay complaints, and stay informed with updates from Barangay San Pablo, Castillejos, Zambales.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/login")}>Submit a Complaint</Button>
                <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById("announcements")?.scrollIntoView({ behavior: "smooth" })}>View Updates</Button>
                <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById("benefits")?.scrollIntoView({ behavior: "smooth" })}>Join the Community</Button>
              </div>

              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Residents served</p>
                  <p className="mt-2 text-3xl font-semibold">San Pablo, Castillejos</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Community trust</p>
                  <p className="mt-2 text-3xl font-semibold">Trusted by your neighbors</p>
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-3xl" />
              <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl ring-1 ring-white/10">
                <div className="mb-5 flex items-center justify-between rounded-3xl bg-slate-900/80 p-4 text-slate-200">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Barangay Overview</p>
                    <p className="mt-2 text-sm font-medium">SP-Complaints Dashboard</p>
                  </div>
                  <MapPin className="h-6 w-6 text-amber-300" />
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-5">
                  <div className="flex items-center gap-4 pb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-amber-300 text-slate-950 shadow-sm">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Barangay Map</p>
                      <p className="text-base font-semibold text-white">San Pablo, Castillejos</p>
                    </div>
                  </div>

                  <div className="relative h-44 overflow-hidden rounded-[1.5rem] bg-slate-900/90 p-4">
                    <div className="absolute left-4 top-4 h-2 w-16 rounded-full bg-amber-300/80" />
                    <div className="absolute right-6 top-10 h-2.5 w-10 rounded-full bg-cyan-300/80" />
                    <div className="absolute left-8 bottom-10 h-2 w-20 rounded-full bg-slate-700" />
                    <div className="absolute left-10 top-16 h-16 w-16 rounded-full bg-slate-800/90 border border-white/10" />
                    <div className="absolute right-8 bottom-12 h-14 w-14 rounded-full bg-amber-300/15 border border-amber-300/20" />
                    <div className="absolute left-16 top-20 h-3 w-24 rounded-full bg-slate-700" />
                    <div className="absolute right-14 top-24 h-3 w-16 rounded-full bg-slate-700" />
                    <div className="absolute left-8 bottom-4 flex items-center gap-2 text-xs text-slate-300">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" /> Barangay hall
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-3xl bg-slate-900/90 p-4">
                    <div className="flex items-center justify-between gap-3 text-slate-200">
                      <p className="text-sm font-medium">Latest Advisory</p>
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-200">Active</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-400">Water distribution schedule update for Barangay San Pablo residents.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { title: "Complaints", value: counts.in_progress },
                      { title: "Resolved", value: counts.resolved },
                    ].map((item) => (
                      <div key={item.title} className="rounded-3xl bg-slate-900/90 p-4">
                        <p className="text-sm text-slate-400">{item.title}</p>
                        <p className="mt-2 text-2xl font-semibold text-white">
                          {isCountsLoading ? "..." : item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/80 px-4 py-2 text-sm text-slate-900">
                <Sparkles className="h-4 w-4" />
                Local identity & trust
              </div>
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900">Designed for Barangay San Pablo residents</h3>
              <p className="max-w-xl text-slate-600 leading-7">
                SP-Complaints is made for the people of Barangay San Pablo, Castillejos, Zambales. It helps neighbors report issues, follow barangay resolutions, and receive announcements from local officials.
              </p>
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Trust Statement</p>
                <p className="mt-3 text-slate-700 leading-7">Trusted by your neighbors in San Pablo, this system helps keep barangay communication clear, accountable, and easy for everyone.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: ClipboardList,
                  title: "Report complaints",
                  description: "Submit barangay issues quickly with photos and details.",
                },
                {
                  icon: Clock3,
                  title: "Track status",
                  description: "See the progress of your report until it is resolved.",
                },
                {
                  icon: BellRing,
                  title: "Receive alerts",
                  description: "Get announcements and community advisories on time.",
                },
                {
                  icon: BookOpen,
                  title: "Access services",
                  description: "Find barangay forms, procedures, and local help resources.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-[#1e3a5f]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                  <Users className="h-4 w-4" /> How it works
                </p>
                <h3 className="text-3xl font-semibold">Simple steps for every resident</h3>
                <p className="text-slate-300 leading-7">No technical experience required—just choose your concern, submit details, and follow the updates.</p>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    step: 1,
                    title: "Choose your concern",
                    description: "Select the complaint type that matches your issue.",
                  },
                  {
                    step: 2,
                    title: "Submit details",
                    description: "Provide a short description and upload a photo if available.",
                  },
                  {
                    step: 3,
                    title: "Track progress",
                    description: "Receive updates and monitor the response from officials.",
                  },
                ].map((item) => (
                  <div key={item.step} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-slate-950 font-semibold">{item.step}</div>
                      <p className="text-sm uppercase tracking-[0.24em] text-amber-200">Step {item.step}</p>
                    </div>
                    <h4 className="mt-4 text-xl font-semibold">{item.title}</h4>
                    <p className="mt-2 text-slate-300 leading-7">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="benefits">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm text-slate-900">
                <CheckCircle2 className="h-4 w-4" /> Benefits
              </p>
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900">What residents gain</h3>
              <p className="max-w-xl text-slate-600 leading-7">
                SP-Complaints makes reporting and receiving local government support easier, more transparent, and more responsive for every household in Barangay San Pablo.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                "Faster response from barangay officials",
                "Transparent complaint tracking",
                "Easy access to updates and services",
                "Better communication within the community",
              ].map((benefit) => (
                <div key={benefit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-slate-900 font-semibold">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 text-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-amber-300/10 px-4 py-2 text-sm text-amber-200">Community Voice</p>
                <h3 className="text-3xl font-semibold">Testimonials from residents</h3>
                <p className="max-w-xl text-slate-400 leading-7">Hear how SP-Complaints helps neighbors in Barangay San Pablo report issues and stay connected with barangay officials.</p>
              </div>

              <div className="grid gap-4">
                {[
                  {
                    quote: "SP-Complaints made it so easy to report a broken streetlight and know the status at every step.",
                    name: "Aling Nena, Resident",
                  },
                  {
                    quote: "Barangay officials now respond faster because the complaint information arrives clearly and directly.",
                    name: "Kapitan Jose",
                  },
                ].map((item) => (
                  <div key={item.name} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <p className="text-lg leading-8 text-slate-100">“{item.quote}”</p>
                    <p className="mt-4 text-sm font-semibold text-amber-300">{item.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8" id="announcements">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div className="space-y-4">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-900">
                <BellRing className="h-4 w-4 text-[#1e3a5f]" /> Announcements
              </p>
              <h3 className="text-3xl font-semibold tracking-tight text-slate-900">Latest barangay news</h3>
              <p className="max-w-xl text-slate-600 leading-7">See current advisories, local events, and important reminders for Barangay San Pablo residents.</p>
            </div>

            <div className="grid gap-4">
              {[
                {
                  title: "Barangay meeting schedule",
                  description: "Join the community meeting on Saturday at the barangay hall to discuss upcoming local projects.",
                },
                {
                  title: "Health check-up drive",
                  description: "Free health screenings will be available next week for all residents in San Pablo.",
                },
                {
                  title: "Water distribution notice",
                  description: "Please check the new water schedule and safety reminders prepared for this week.",
                },
              ].map((announcement) => (
                <div key={announcement.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3 text-[#1e3a5f]">
                    <BellRing className="h-5 w-5" />
                    <h4 className="text-lg font-semibold text-slate-900">{announcement.title}</h4>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{announcement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8fafc]" id="support">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4">
                <p className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                  <Phone className="h-4 w-4" /> Contact & Support
                </p>
                <h3 className="text-3xl font-semibold tracking-tight text-slate-900">Need help or more information?</h3>
                <p className="max-w-xl text-slate-600 leading-7">Barangay hall contact details and support options for residents who need assistance filing a report or understanding the process.</p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Barangay Hall</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">Barangay San Pablo Office</p>
                  <p className="mt-3 text-sm text-slate-600">San Pablo, Castillejos, Zambales</p>
                  <p className="mt-2 text-sm text-slate-600">Phone: (047) 1234-5678</p>
                  <p className="mt-1 text-sm text-slate-600">Email: spcomplaints@sanpablo.gov.ph</p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">FAQ</p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li>How do I submit a complaint?</li>
                    <li>How long does resolution take?</li>
                    <li>Can I attach a photo?</li>
                    <li>Who can see my report?</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900">SP-Complaints</p>
            <p className="mt-2 text-sm text-slate-600">Serving Barangay San Pablo, Castillejos, Zambales.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <Button variant="ghost" size="sm" onClick={() => navigate("/terms-of-service")}>Privacy Policy</Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/privacy-policy")}>Terms</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/login")}>Download App</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
